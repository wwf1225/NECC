import {getAllVersion,getAllPOIList} from "../api/app";
import {MapId} from "../utils/config";
import Storage from "../utils/storage_cache";
import {isFunction, VOID} from "../utils/util";

// 缓存的关键字
const CacheKeys = {
    POIVERSION: 'poi_version',
    POIBEACONS: 'poi_message'
};
// 定时器触发阈值
const TimeThreshold = 3000;
// 定时器触发的次数
const CountThreshold = 3;

// beacon数据全局缓存
let globalPoi = {};  //eslint-disable-line

/**
 * 检测标签的版本号，请求失败之后，会每隔3s重新请求一次，一共请求3次
 * @param {Number} reqCount=0 - 方法调用次数
 * */
export function getAllPoiListCache(reqCount = 0) {
    getAllVersion({
        venueuuid: MapId,
        datatype: "POI_DATA_VERSION"
    }).then(function (res) {
        // console.log(res);
        if (res.__state) {
            compareVersionPOIWithCache(res.data.version);
        } else if (reqCount < CountThreshold) {
            setTimeout(function () {
              getAllPoiListCache(++reqCount);
            }, TimeThreshold);
        }
    });
}

/**
 * 更新beacon的缓存数据。若请求数据失败，则每隔3s请求一次数据，一共重复3次
 * @param {Number} reqCount - 重复请求的统计次数
 * @param {Function} callback - 缓存beacon数据之后回调方法
 * */
export function updateLabelPOI(reqCount = 0, callback) {
    if (isFunction(reqCount)) {
        callback = reqCount;
        reqCount = 0;
    } else {
        callback = callback || VOID;
    }
    // old
    // return getAllPOIList({
    //     venueuuid: MapId,
    //     clienttype: "1"
    // }).then(function (res) {
    //     console.log("======拉取key码返回数据",res);
    //     if (res.__state) {
    //         callback(setPOICache(res.data));
    //     } else if (reqCount < CountThreshold) {
    //         setTimeout(function () {
    //           updateLabelPOI(++reqCount, callback);
    //         }, TimeThreshold);
    //     }
    // });

    return getAllPOIList({
        venueuuid: MapId,
        clienttype: "1"
    }).then(function (res) {
        console.log("======拉取key码返回数据",res);
        if (res.code == 0) {
            callback(setPOICache(res.data));
        } else if (reqCount < CountThreshold) {
            setTimeout(function () {
                updateLabelPOI(++reqCount, callback);
            }, TimeThreshold);
        }
    });

}

/**
//  * 查找蓝牙标签数据
//  * @param {String} major - 标签Major值
//  * @param {String} minor - 标签Minor值
//  * */
// export function findBeacon(major, minor) {
//     if (major === undefined || minor === undefined) {
//         return globalPoi;
//     }

//     return globalPoi[`${major}_${minor}`];
// }

// 比较版本号是否相等
function compareVersionPOIWithCache(version) {
    const cacheVersion = Storage.get(CacheKeys.POIVERSION);
    // console.log(cacheVersion);
    if (version !== cacheVersion) {
        updateLabelPOI(function (isSaved) {
            console.log(isSaved);
            if (isSaved) Storage.set(CacheKeys.POIVERSION, version);
        });
    } else {
        getPOICache();
    }
}

// 获取缓存的beacon数据
function getPOICache() {
    const caches = Storage.get(CacheKeys.POIBEACONS);

    globalPoi = caches;

    return caches;
}

// 整理缓存的beacon数据，并缓存到本地中
function setPOICache(beacons) {
    // console.log(beacons);
    const caches = {};

    for (let i = 0, ii = beacons.length; i < ii; i++) {
        const beacon = beacons[i];
        const beaconId = `${beacon.encode}`;

        caches[beaconId] = {
            fid: Number(beacon.fid),
        };
    }

    // 更新全局缓存
    globalPoi = caches;

    return Storage.set(CacheKeys.POIBEACONS, caches);
}
