import Storage from "../utils/storage_cache";
import {getNameByGroupID} from "../utils/util";
import {AppCode, AppType, MapId, MapOptions} from "../utils/config";
import {saveNewHotSearchData, saveNewHotSearchDatas} from "../api/app";
import {mobileModel, osVersion} from 'mobile-device-detect';
import LocalCache from "../utils/storage_cache";
import moment from "moment";

// 缓存搜索历史关键字
const CacheKeys = {
    HISTORY: '_history_',
    HOTHISTORY: "_hot_history"
};

var uploadHotTimer = null; // 定时器 

/**
 * 定义一个函数接收传递过来的一个对象
 * 判断缓存中是否有该条数据 如果没有则缓存 有则不作处理
 *     console.log(mobileModel,osVersion,osName);
 */

//========上传热搜========//Storage.get("openID")
export function SearchHistory(params, time, currentX, currentY) {
    saveNewHotSearchData({
        name: params.name,
        phonetype: "2",
        ename: params.ename,
        sx: params.mapCoord.x,
        sy: params.mapCoord.y,
        sz: params.mapCoord.z,
        groupid: params.groupID,
        groupname: getNameByGroupID(params.groupID),
        venueuuid: MapId,
        venuename: MapOptions.fmapAppName,
        searchtime: time,
        uploadtime: time,
        fid: params.FID,
        type: params.typeID,
        iosphonemodel: mobileModel,
        iosuuid: Storage.get("openID"),
        iosversion: osVersion,
        cx: currentX,
        cy: currentY,
        networktype: 2
    }).then((res) => {
        console.log("上传热搜: ", res);
        if (!res.__state) {
            console.log("=======> A");
            params.upload = false;
            setHotSearchCache(params);
            uploadHotTimer = setTimeout(function () {
                getSearchHotMessage();
            }, 10000);
        } else {
            console.log("=======> B");
            params.upload = true;
            setHotSearchCache(params);
        }
    })
}


// 获取系统版本
function getOsVersion() {
    var u = navigator.userAgent, version = ''
    if (u.indexOf('Mac OS X') > -1) {
        // ios
        var regStr_saf = /OS [\d._]*/gi
        var verinfo = u.match(regStr_saf)
        version = 'IOS' + (verinfo + '').replace(/[^0-9|_.]/ig, '').replace(/_/ig, '.')
    } else if (u.indexOf('Android') > -1 ||
        u.indexOf('Linux') > -1) {
        // android
        version = 'Android' + u.substr(u.indexOf('Android') + 8, u.indexOf(';', u.indexOf('Android')) - u.indexOf('Android') - 8)
    } else if (u.indexOf('BB10') > -1) {
        // 黑莓bb10系统
        version = 'blackberry' + u.substr(u.indexOf('BB10') + 5, u.indexOf(';', u.indexOf('BB10')) - u.indexOf('BB10') - 5)
    } else if (u.indexOf('IEMobile') > -1) {
        // windows phone
        version = 'winphone' + u.substr(u.indexOf('IEMobile') + 9, u.indexOf(';', u.indexOf('IEMobile')) - u.indexOf('IEMobile') - 9)
    } else {
        var userAgent = navigator.userAgent.toLowerCase()
        if (userAgent.indexOf('windows nt 5.0') > -1) {
            version = 'Windows 2000'
        } else if (userAgent.indexOf('windows nt 5.1') > -1 || userAgent.indexOf('windows nt 5.2') > -1) {
            version = 'Windows XP'
        } else if (userAgent.indexOf('windows nt 6.0') > -1) {
            version = 'Windows Vista'
        } else if (userAgent.indexOf('windows nt 6.1') > -1 || userAgent.indexOf('windows 7') > -1) {
            version = 'Windows 7'
        } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows 8') > -1) {
            version = 'Windows 8'
        } else if (userAgent.indexOf('windows nt 6.3') > -1) {
            version = 'Windows 8.1'
        } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows nt 10.0') > -1) {
            version = 'Windows 10'
        } else {
            version = 'Unknown'
        }
    }
    return version
}


// //系统版本和手机型号
// Array.prototype.contains = function (needle) {
//     for (i in this) {
//         if (this[i].indexOf(needle) > 0)
//             return i;
//     }
//     return -1;
// }
//
// var device_type = navigator.userAgent; //获取userAgent信息
// var md = new MobileDetect(device_type); //初始化mobile-detect
// var os = md.os(); //获取系统
// var model = "";
// if (os == "iOS") { //ios系统的处理
//     os = md.os() + md.version("iPhone");
//     model = md.mobile();
// } else if (os == "AndroidOS") { //Android系统的处理
//     os = md.os() + md.version("Android");
//     var sss = device_type.split(";");
//     var i = sss.contains("Build/");
//     if (i > -1) {
//         model = sss[i].substring(0, sss[i].indexOf("Build/"));
//     }
// }
//
// // console.log(os + "---" + model); //打印系统版本和手机型号


//批量上传热搜数据
export function HotSearchHistoryBatchUpload(paramsx) {
    var uploadData = [];
    var currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    for (var index in paramsx) {
        var params = paramsx[index];
        if (params.upload) {
            continue;
        }

        uploadData.push({
            unid: LocalCache.get("openID"),
            appcode: AppCode,
            apptype: AppType,
            name: params.name,
            phonetype: "2",
            ename: params.ename,
            sx: params.mapCoord.x,
            sy: params.mapCoord.y,
            sz: params.mapCoord.z,
            groupid: params.groupID,
            groupName: getNameByGroupID(params.groupID),
            venueuuid: MapId,
            venuename: MapOptions.fmapAppName,
            searchtime: currentTime,
            uploadtime: currentTime,
            fid: params.FID,
            type: params.typeID,
            cx: params.cx,
            cy: params.cy,
            networktype: 2,
            phoneModel: mobileModel,
            phoneUuid: LocalCache.get("openID"),
            phoneVersion: getOsVersion(),
        });
    }
    if (uploadData.length <= 0) {
        return;
    }

    saveNewHotSearchDatas(uploadData).then((res) => {
        // console.log("批量上传结果", res);
        //上传成功
        // if(res.__state){
        if (res.code == 0) {
            // Storage.set(CacheKeys.HOTHISTORY, null);
            for (var param in paramsx) {
                paramsx[param].upload = true;
            }
            clearTimeout(uploadHotTimer);
            uploadHotTimer = null;
            Storage.set(CacheKeys.HOTHISTORY, paramsx);
        } else {
            //上传失败
            uploadHotTimer = setTimeout(function () {
                getSearchHotMessage();
            }, 5000);
        }
    })
}


//无论上传成功还是失败都将数据缓存在本地
function setHotSearchCache(params) {

    var history = {};

    let xx = Storage.get(CacheKeys.HOTHISTORY);

    if (xx === null) {
        history[`${params.typeID}_${params.FID}`] = {
            FID: Number(params.FID),
            typeID: Number(params.typeID),
            name: params.name,
            ename: params.ename,
            ID: params.ID,
            mapCoord: params.mapCoord,
            groupID: params.groupID,
            upload: params.upload
        };
        return Storage.set(CacheKeys.HOTHISTORY, history);
    } else {
        history = xx;
        history[`${params.typeID}_${params.FID}`] = history[`${params.typeID}_${params.FID}`] = {
            FID: Number(params.FID),
            typeID: Number(params.typeID),
            name: params.name,


            ename: params.ename,
            ID: params.ID,
            mapCoord: params.mapCoord,
            groupID: params.groupID,
            upload: params.upload
        };
        return Storage.set(CacheKeys.HOTHISTORY, history);
    }
}

function getSearchHotMessage() {
    var searchHot = Storage.get(CacheKeys.HOTHISTORY);
    HotSearchHistoryBatchUpload(searchHot);
}

//========上传热搜========//


//========用户缓存点击item信息========//
export function onClickMessageBetch(params) {

    var clickCachehistory = {};

    let clickCache = Storage.get(CacheKeys.HISTORY);

    if (clickCache === null) {
        clickCachehistory[`${params.typeID}_${params.FID}`] = {
            FID: Number(params.FID),
            typeID: Number(params.typeID),
            name: params.name,
            ename: params.ename,
            ID: params.ID,
            mapCoord: params.mapCoord,
            groupID: params.groupID
        };
        return Storage.set(CacheKeys.HISTORY, clickCachehistory);
    } else {
        clickCachehistory = clickCache;
        clickCachehistory[`${params.typeID}_${params.FID}`] = clickCachehistory[`${params.typeID}_${params.FID}`] = {
            FID: Number(params.FID),
            typeID: Number(params.typeID),
            name: params.name,
            ename: params.ename,
            ID: params.ID,
            mapCoord: params.mapCoord,
            groupID: params.groupID
        };
        return Storage.set(CacheKeys.HISTORY, clickCachehistory);
    }
}

//========用户缓存点击item信息========//
 