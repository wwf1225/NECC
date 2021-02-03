// import {Lang} from "./translation";
// 工具函数，共用方法

// 空函数
export function VOID() {
}

/**
 * 获取对象的数据类型
 * @return {String}
 */
const objectType = function (obj) {
    return Object.prototype.toString.call(obj);
};

// 函数类型
export function isFunction(value) {
    return objectType(value) === '[object Function]';
}

// 数组类型
export function isArray(value) {
    return objectType(value) === '[object Array]';
}

// 数组类型
export function isNumber(value) {
    return objectType(value) === '[object Number]';
}

// 获取URL中的query参数
export function getURLParams() {
    const url = window.location.search; //获取url中"?"符后的字串
    const params = {};

    if (url.indexOf("?") !== -1) {
        const strs = url.substr(1).split("&");

        for (let i = 0, ii = strs.length; i < ii; i++) {
            const query = strs[i].split("=");

            params[query[0]] = decodeURIComponent(query[1]);
        }
    }

    return params;
}


// 精确小数点
export function precise(num, decimal = 4) {
    num = parseFloat(num);

    if (isNumber(num)) {
        num = num.toFixed(decimal);
        return parseFloat(num);
    }

    return null;
}

// 判断值是否为空
export function isEmpty(value) {
    return value === undefined || value === '' || value === null;
}


// 获取楼层名称
export function getNameByGroupID(gid) {
    switch (gid) {
        case 1:
            return "B1";
        case 2:
            return "F1";
        case 3:
            return "F2";
        case 4:
            return "F3";
        default:
            if (isNumber(gid)) {
                return `F${gid}`;
            }
            return '';
    }
}


const platformsObject = {
    rule: '0123456789abcdefghijklmnopqrstuvwxyz',
    unit_offset: 0.1,
    y_origin: 3656984.6985,
    x_origin: 13501913.0404
}

//编码
export function KEncode(x_share, y_share, floor) {
    // 获取到的分享信息
    var input_string = "05fa0cv"; //eslint-disable-line
    var share = ""; //eslint-disable-line
    // 结果楼层
    var res_floor = Number(floor) + 1;
    // 编码的x坐标和y坐标
    var convert_result = "";
    var convert_1 = "";
    var convert_2 = "";
    // 取坐标偏移量除以单位偏移量，看偏移了多少个单位，计算需要取整
    var temp_x = parseInt((Number(x_share) - Number(platformsObject.x_origin)) / Number(platformsObject.unit_offset));
    while (temp_x >= 36) {
        var num = parseInt(Number(temp_x) % 36);
        var temp_x = parseInt((temp_x) / 36); //eslint-disable-line
        convert_1 = platformsObject.rule[num] + convert_1;
    }
    // 在数学matlab中，需要加1，因为没有0值， 在java中不需要加1
    convert_1 = platformsObject.rule[temp_x] + convert_1;
    while (convert_1.length < 3) {
        convert_1 = "0" + convert_1;
    }
    var temp_y = parseInt((Number(y_share) - Number(platformsObject.y_origin)) / (platformsObject.unit_offset));
    while (temp_y >= 36) {
        var num = parseInt(Number(temp_y) % 36); //eslint-disable-line
        var temp_y = parseInt((temp_y) / 36); //eslint-disable-line
        convert_2 = platformsObject.rule[num] + convert_2;
    }
    convert_2 = platformsObject.rule[temp_y] + convert_2;
    while (convert_2.length < 3) {
        convert_2 = "0" + convert_2;
    }
    // 合并码值
    convert_result = res_floor + convert_1 + convert_2;
    return convert_result;
}


//解码
export function KDecoder(k_code) {
    var input_string = k_code;
    var coor_floor = (Number(input_string[0]) - 1).toString();
    var temp_x = input_string.substring(1, 4);
    var loop_x = 3;
    var code_x = "";
    while (loop_x-- > 0) {
        if (temp_x[0] != '0') { //eslint-disable-line
            code_x = code_x + temp_x[0];
        }
        temp_x = temp_x.substring(1);
    }
    var temp_y = input_string.substring(4, 7);
    var loop_y = 3;
    var code_y = "";
    while (loop_y-- > 0) {
        if (temp_y[0] != '0') { //eslint-disable-line
            code_y = code_y + temp_y[0];
        }
        temp_y = temp_y.substring(1);
    }

    var convert_x = 0;
    // 还原计算
    for (var ix = 0; ix < code_x.length; ix++) {
        var num_x = -1;
        for (let r = 0; r < 36; r++) {
            if (platformsObject.rule[r] == code_x[code_x.length - ix - 1]) { //eslint-disable-line
                num_x = r;
            }
        }
        // 36进制还原
        var jinzhi_power = 1;
        for (var k = 0; k < ix; k++) {
            jinzhi_power = jinzhi_power * 36;
        }
        convert_x = convert_x + (num_x * jinzhi_power);
    }
    var coor_x = (platformsObject.x_origin) + convert_x * (platformsObject.unit_offset);
    var convert_y = 0;
    for (var iy = 0; iy < code_y.length; iy++) {
        var num_y = -1;
        for (let r = 0; r < 36; r++) {
            if (platformsObject.rule[r] == code_y[code_y.length - iy - 1]) { //eslint-disable-line
                num_y = r;
            }
        }
        // 36进制还原
        var jinzhi_power = 1; //eslint-disable-line
        for (var k = 0; k < iy; k++) { //eslint-disable-line
            jinzhi_power = jinzhi_power * 36;
        }
        convert_y = convert_y + num_y * jinzhi_power;
    }
    var coor_y = (platformsObject.y_origin) + convert_y * (platformsObject.unit_offset);
    var shareLocationInfo = {
        'coor_x': coor_x.toString(),
        'coor_y': coor_y.toString(),
        'floor_id': coor_floor.toString()
    };
    return shareLocationInfo;
}

export function useParamIsInArrays(cacheList, typePoiList, collectionType) {
    let resList = [];
    if (!(cacheList && typePoiList && collectionType)) {
        return resList;
    }
    if (collectionType === 'others') {
        // console.log("others");
        for (let key in cacheList) {
            let typeidIdx = key.indexOf("_");
            let curTypeId = key.substring(0, typeidIdx);
            let curCachePm = cacheList[key];
            let used = false;
            for (let type in typePoiList) {
                if (type === "others") {
                    continue;
                }
                if (findStrIsInArray(curTypeId, typePoiList[type])) {
                    used = true;
                }
            }
            if (!used) {
                resList.push({
                    centerX: curCachePm.centerX,
                    centerY: curCachePm.centerY,
                    currentX: curCachePm.currentX,
                    currentY: curCachePm.currentY,
                    fid: curCachePm.fid,
                    groupid: curCachePm.groupid,
                    typeid: curCachePm.typeid,
                    name: curCachePm.name,
                    ename: curCachePm.ename,
                    collectionType: "others"
                });
            }
        }
    } else {
        for (let key in cacheList) {
            let typeidIdx = key.indexOf("_");
            let curTypeId = key.substring(0, typeidIdx);
            let curCachePm = cacheList[key];
            if (checkParamInArray(curTypeId, typePoiList)) {
                resList.push({
                    centerX: curCachePm.centerX,
                    centerY: curCachePm.centerY,
                    currentX: curCachePm.currentX,
                    currentY: curCachePm.currentY,
                    fid: curCachePm.fid,
                    groupid: curCachePm.groupid,
                    typeid: curCachePm.typeid,
                    name: curCachePm.name,
                    ename: curCachePm.ename,
                    collectionType: collectionType
                });
            }
        }
    }
    return resList;
}

export function checkParamInArray(param, checkArray) {
    for (let i = 0, len = checkArray.length; i < len; i++) {
        if (checkArray[i] === param) {
            return true;
        }
    }
    return false;
}

export function findStrIsInArray(str, arr) {
    if (!(str && arr)) {
        return false;
    }
    for (let i = 0, len = arr.length; i < len; i++) {
        if (str === arr[i]) {
            return true;
        }
    }
    return false;
}

export function sortTheCacheList(cacheList, TypePoi) {
    let resList = [];
    if (!(cacheList && TypePoi)) {
        return resList;
    }
    for (let key in cacheList) {
        let typeidIdx = key.indexOf("_");
        let curTypeId = key.substring(0, typeidIdx);
        let curCachePm = cacheList[key];
        let used = false;
        for (let type in TypePoi) {
            let collectionType = type;
            if (findStrIsInArray(curTypeId, TypePoi[type])) {
                resList.push({
                    centerX: curCachePm.centerX,
                    centerY: curCachePm.centerY,
                    currentX: curCachePm.currentX,
                    currentY: curCachePm.currentY,
                    fid: curCachePm.fid,
                    groupid: curCachePm.groupid,
                    typeid: curCachePm.typeid,
                    name: curCachePm.name,
                    ename: curCachePm.ename,
                    collectionType: collectionType
                });
                used = true;
                break;
            }
        }
        if (!used) {
            resList.push({
                centerX: curCachePm.centerX,
                centerY: curCachePm.centerY,
                currentX: curCachePm.currentX,
                currentY: curCachePm.currentY,
                fid: curCachePm.fid,
                groupid: curCachePm.groupid,
                typeid: curCachePm.typeid,
                name: curCachePm.name,
                ename: curCachePm.ename,
                collectionType: "others"
            });
        }
    }
    return resList;
}


export function sortTheCacheHistoryList(cacheList, TypePoi) {
    let resList = [];
    if (!(cacheList && TypePoi)) {
        return resList;
    }
    for (let key in cacheList) {
        let typeidIdx = key.indexOf("_");
        let curTypeId = key.substring(0, typeidIdx);
        let curCachePm = cacheList[key];
        let used = false;
        for (let type in TypePoi) {
            let collectionType = type;
            if (findStrIsInArray(curTypeId, TypePoi[type])) {
                resList.push({
                    FID: curCachePm.FID,
                    ID: curCachePm.ID,
                    mapCoord: curCachePm.mapCoord,
                    groupID: curCachePm.groupID,
                    typeID: curCachePm.typeID,
                    name: curCachePm.name,
                    ename: curCachePm.ename,
                    collectionType: collectionType
                });
                used = true;
                break;
            }
        }
        if (!used) {
            resList.push({
                FID: curCachePm.FID,
                ID: curCachePm.ID,
                mapCoord: curCachePm.mapCoord,
                groupID: curCachePm.groupID,
                typeID: curCachePm.typeID,
                name: curCachePm.name,
                ename: curCachePm.ename,
                collectionType: "others"
            });
        }
    }
    return resList;
}