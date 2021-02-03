import {AppCode, AppType, MapId} from "../utils/config";
import Storage from "../utils/storage_cache";
import {isFunction, VOID} from "../utils/util";
import LocalCache from "../utils/storage_cache";
import {getBeacons, getBeaconVersion, searchCollectionList} from "../api/app";
import qwest from "qwest";

// 缓存的关键字
const CacheKeys = {
    VERSION: '_version_',
    BEACONS: '_beacons_',
    COLLECT: '_collect_'
};
// 定时器触发阈值
const TimeThreshold = 3000;
// 定时器触发的次数
const CountThreshold = 3;

// beacon数据全局缓存
let globalBeacons = {};

/**
 * 获取收藏列表数据缓存至本地
 * LocalCache.get("openID")
 * @param {unid:  用户的openID,clienttype: 客户端类型（1小程序）}
 */

// export function initialCollectList(reqCount = 0) {
//     searchCollectionList({
//         unid: LocalCache.get("openID"),
//         // unid: "oM5F45CR5nKMIzRZhVkktJCZtZrw",
//         clienttype: "1",
//         current: "1",
//         size: "1000"
//     }).then((res) => {
//         console.log('查询收藏成功==',res);
//         //将数据缓存至本地
//         if (res.code === "0" || res.code === 0 ) {
//             setCollectWithCache(res.data.records);
//         } else if (reqCount < CountThreshold) {
//             setTimeout(function () {
//                 initialCollectList(++reqCount);
//             }, TimeThreshold);
//         }
//     })
// }

export function initialCollectList(reqCount = 0) {
    qwest.post("/manage/api/appclient/wxusercollections/getUserCollectionsByOpenidAndPage", {
        unid: LocalCache.get("userInfo").userUuid,
        venueuuid:MapId,
        appcode: AppCode,
        apptype: AppType,
        clienttype: "1",
        current: "1",
        size: "1000"
    })
        .then(function (xhr, res) {
            console.log('查询收藏成功==', res);
            //将数据缓存至本地
            if (res.code === "0" || res.code === 0) {
                setCollectWithCache(res.data.records);
            } else if (reqCount < CountThreshold) {
                setTimeout(function () {
                    initialCollectList(++reqCount);
                }, TimeThreshold);
            }

        })
        .catch(function (e, xhr, res) {
            // Process the error
            console.error(e);
            console.error(res);
        })
        .complete(function () {
            // console.error("  ======  complete ======= ");
        });

}


/**
 * 检测标签的版本号，请求失败之后，会每隔3s重新请求一次，一共请求3次
 * @param {Number} reqCount=0 - 方法调用次数
 * */
export function initialLabelBeacon(reqCount = 0) {
    getBeaconVersion({
        venueuuid: MapId,
        datatype: "LABEL_WECHAT_VERSION"
    }).then(function (res) {
        console.log("getLabelWechatVersion ======  ", res);
        if (res.code === "0" || res.code === 0) {
            compareVersionWithCache(res.data.version);
        } else if (reqCount < CountThreshold) {
            setTimeout(function () {
                initialLabelBeacon(++reqCount);
            }, TimeThreshold);
        }
    });
}

/**
 * 更新beacon的缓存数据。若请求数据失败，则每隔3s请求一次数据，一共重复3次
 * @param {Number} reqCount - 重复请求的统计次数
 * @param {Function} callback - 缓存beacon数据之后回调方法
 * */
export function updateLabelBeacon(reqCount = 0, callback) {
    if (isFunction(reqCount)) {
        callback = reqCount;
        reqCount = 0;
    } else {
        callback = callback || VOID;
    }
    return getBeacons({
        venueuuid: MapId,
        curVersion: Storage.get(CacheKeys.VERSION) == null ? 0 : Storage.get(CacheKeys.VERSION)
    }).then(function (res) {
        // console.log("更新缓存的蓝牙标签数据res",res);
        // 逻辑修改： 如果两个版本号不相等的话，就先更新蓝牙标签数据，然后更新版本号；如果版本号相等的话，就不做更新

        console.log("updateLabelBeacon ======  ", res);

        if (res.__state) {
            callback(setBeaconCache(res.data));
        } else if (reqCount < CountThreshold) {
            setTimeout(function () {
                updateLabelBeacon(++reqCount, callback);
            }, TimeThreshold);
        }
    });
}

/**
 * 查找蓝牙标签数据
 * @param {String} major - 标签Major值
 * @param {String} minor - 标签Minor值
 * */
export function findBeacon(major, minor) {
    if (major === undefined || minor === undefined) {
        return globalBeacons;
    }

    return globalBeacons[`${major}_${minor}`];
}

// 比较版本号是否相等
function compareVersionWithCache(version) {
    const cacheVersion = Storage.get(CacheKeys.VERSION);
    console.log("!!!! cacheVersion: ", cacheVersion);
    if (version !== cacheVersion) {
        // console.log("版本不相等，执行");
        updateLabelBeacon(function (isSaved) {
            if (isSaved) Storage.set(CacheKeys.VERSION, version);
        });
    } else {
        // console.log("未执行");
        getBeaconCache();
    }
}

// 获取缓存的beacon数据
function getBeaconCache() {
    const caches = Storage.get(CacheKeys.BEACONS);
    globalBeacons = caches;
    console.log("globalBeacons", globalBeacons);
    return caches;
}


//将获取所有的收藏列表缓存至本地
//判断缓存中是否有 1: 有则直接设置成缓存数据  2: 无则重新执行接口获取收藏列表的数据
function setCollectWithCache(data) {

    let collect = {};

    for (let i = 0, ii = data.length; i < ii; i++) {
        const beacon = data[i];
        const beaconId = `${beacon.typeid}_${beacon.fid}`;

        collect[beaconId] = {
            fid: Number(beacon.fid),
            typeid: Number(beacon.typeid),
            name: beacon.name,
            groupid: beacon.groupid,
            centerX: Number(beacon.centerX),
            centerY: Number(beacon.centerY),
            currentX: Number(beacon.currentX),
            currentY: Number(beacon.currentY),
            ename: beacon.ename
        };
    }

    return Storage.set(CacheKeys.COLLECT, collect);

}


// 原来的思路是将所有的标签数据都缓存到一个key中，key是CacheKeys.BEACONS
// 整理缓存的beacon数据，并缓存到本地中
function setBeaconCache(beacons) {
    let caches = {};
    var cacheBeacons = Storage.get(CacheKeys.BEACONS);
    if (cacheBeacons !== null) {
        let newBeacons = beacons;
        caches = cacheBeacons;
        for (let j = 0, jj = newBeacons.length; j < jj; j++) {
            //根据新传入的数据的类型进行判断  CREATE新增
            if (newBeacons[j].operationsign === "CREATE") {
                // console.log("CREATE");
                const beacon = newBeacons[j];
                const beaconId = `${newBeacons[j].major}_${newBeacons[j].minor}`;
                caches[beaconId] = {
                    lng: Number(beacon.x),
                    lat: Number(beacon.y),
                    floorId: beacon.groupId + ''
                };
            }
            //UPDATE更新
            if (newBeacons[j].operationsign === "UPDATE") {
                // console.log("UPDATE");
                const beacon = newBeacons[j];
                const beaconId = `${newBeacons[j].major}_${newBeacons[j].minor}`;
                caches[beaconId] = {
                    lng: Number(beacon.x),
                    lat: Number(beacon.y),
                    floorId: beacon.groupId + ''
                };
            }
            //DELECT删除
            if (newBeacons[j].operationsign === "DELETE") {
                // console.log("DELETE");
                const beaconId = `${newBeacons[j].major}_${newBeacons[j].minor}`;
                // caches[beaconId] = null;
                delete caches[beaconId];
            }
        }
    } else {
        //  先申请空间
        for (let i = 0, ii = beacons.length; i < ii; i++) {
            let beacon = beacons[i];
            let beaconId = `${beacon.major}_${beacon.minor}`;
            caches[beaconId] = {
                lng: Number(beacon.x),
                lat: Number(beacon.y),
                floorId: beacon.groupId + ''
            };
        }
    }
    // 更新全局缓存
    globalBeacons = caches;

    return Storage.set(CacheKeys.BEACONS, caches);
}



