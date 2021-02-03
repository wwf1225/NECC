// 清理获取到蓝牙数据，处理信号突变问题

import {findBeacon} from "./label_beacon";

let beaconCache = {};
let beaconCacheCount = 0;

const CacheThreshold = 50; // 缓存数量阈值
const TimeThreshold = 60000; // 缓存时间阈值，单位ms

/*
* 清理蓝牙数据，清理原则如下：
* 1、rssi大于-5或者小于-95的数据都忽略，不采用；
* 2、用于rssi排序的beacon，其信号要和上一次的信号做平均值运算，若上次的信号不存在，则直接拿当前的信号来用；
* 3、排序时按信号值从大到小排序；
* */
export function cleanBeacons(beacons) {
    const filters = [];
    const timeStamp = Date.now();

    cleanBeaconCache(timeStamp);


    for (let i = 0, ii = beacons.length; i < ii; i++) {
        const beacon = beacons[i];
        const beaconRssi = Number(beacon.rssi);

        const major = beacon.major;
        const minor = beacon.minor;

        const beaconId = `${major}_${minor}`;

        // 缓存的蓝牙标签数据
        const cacheBeacon = findBeacon(major, minor);

        if (cacheBeacon && beaconRssi <= -5 && beaconRssi >= -90) {
            const lastBeacon = beaconCache[beaconId];

            let rssi = beaconRssi;
            if (lastBeacon) {
                rssi = lastBeacon.rssi * 0.4 + beaconRssi * 0.6; // 取上一次的信号求平均值
                lastBeacon.rssi = beaconRssi;
                lastBeacon.time = timeStamp;
            } else {
                beaconCache[beaconId] = {rssi: beaconRssi, time: timeStamp}; // 添加一个新的beacon
                beaconCacheCount++; // 统计一共添加的beacon缓存数量
            }

            filters.push({
                major: beacon.major,
                minor: beacon.minor,
                rssi: rssi,
                accuracy: Number(beacon.accuracy),
                lng: cacheBeacon.lng,
                lat: cacheBeacon.lat,
                floorId: cacheBeacon.floorId
            });
        }
    }

    return sortBeaconByRssi(filters);
}

// 重置缓存的beacon数据
export function resetBeaconCahe() {
    beaconCache = {};
}

// 按信号值由大到小排序
function sortBeaconByRssi(beacons) {
    return beacons.sort(function (pre, next) {
        return next.rssi - pre.rssi;
    });
}

// 超出缓存数量时，做一下缓存清理
// 按时间，倒序排序，时间久的清理掉
function cleanBeaconCache(nowTime) {
    if (beaconCacheCount > CacheThreshold) {
        const caches = [];
        for (let key in beaconCache) {
            const beacon = beaconCache[key];

            // 在一定时间范围内的保留，其他去掉
            if (nowTime - beacon.time < TimeThreshold) {
                caches.push({key: key, ...beacon});
            }
        }

        const sorts = caches.sort(function (pre, next) {
            return next.time - pre.time;
        });
        const result = {};
        let count = 0;

        sorts.slice(0, CacheThreshold)
            .forEach(function (cacheBeacon) {
                result[cacheBeacon.key] = {rssi: cacheBeacon.rssi, time: cacheBeacon.time};
                count++;
            });

        beaconCache = result;
        beaconCacheCount = count;
    }
}
