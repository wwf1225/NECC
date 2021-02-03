import {initialCompass, destroyCompass} from "./compass";
import {initialPedometer, destroyPedometer} from "./pedometer";
import {isArray, isFunction, VOID} from "../utils/util";
import {setBLEListener, unsetBLEListener, getOriginBeaconData} from "./wechat_sdk";
import {cleanBeacons} from "./clean_beacons";
import {notify} from '../components/notify_toast/notify';


// 地理位置计算
export const GeoUtil = {
    // the earth’s radius in meters
    Radius: 6371393,
    /**
     * @param {Number[]} lngLat -  Expected [lng, lat] EPSG:4326
     * @param {Number} bearing Bearing in degrees
     * @param {Number} distance Distance in meters
     * @return {Array} Lon-lat coordinate.
     */
    nextCoord: function (lngLat, bearing, distance) {
        /**
         * http://www.movable-type.co.uk/scripts/latlong.html
         **/
        const ratio = Number(distance) / GeoUtil.Radius; // angular distance in radians
        const bearingRadian = GeoUtil.toRadian(Number(bearing)); // the bearing (clockwise from north)
        const lngRadian = GeoUtil.toRadian(lngLat[0]);
        const latRadian = GeoUtil.toRadian(lngLat[1]);

        const latRadian2 = Math.asin(Math.sin(latRadian) * Math.cos(ratio) + Math.cos(latRadian) * Math.sin(ratio) * Math.cos(bearingRadian));

        let lngRadian2 = lngRadian + Math.atan2(Math.sin(bearingRadian) * Math.sin(ratio) * Math.cos(latRadian), Math.cos(ratio) - Math.sin(latRadian) * Math.sin(latRadian2));
        // normalise to -180..+180°
        lngRadian2 = (lngRadian2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

        return [GeoUtil.toDegree(lngRadian2), GeoUtil.toDegree(latRadian2)]
    },
    // 弧度转为度
    toDegree: function (n) {
        return n * 180 / Math.PI
    },
    // 度转为弧度
    toRadian: function (n) {
        return n * Math.PI / 180
    }
};

// 定位坐标回调方法
let Motion_Listener = VOID;
// 方向回调方法
let Orientation_Listener = VOID;
// 蓝牙定位回调方法
let BLE_Location_Listener = null;

// 惯导起点坐标，也是当前坐标
let inertialCoord = null;

//默认当前楼层
let floor_id = 2;

//上次更新的beacon
let last_beacon = null; //eslint-disable-line

//上次更新的时间
let last_beacon_update_time = 0;
let last_strong_update_time = 0; //eslint-disable-line

//同一个beacon下一次强更新位置的时间长度
// let beacon_update_time_theshold1 = 5500;
// //同一个beacon下一次半更新位置的时间长度
// let beacon_update_time_theshold2 = 3500;
// //同一个beacon下一次弱更新位置的时间长度
// let beacon_update_time_theshold3 = 800;
//同一个beacon下一次弱更新位置的时间长度
//let beacon_strong_update_time_theshold = 7000; //eslint-disable-line

// GPS坐标数据{lngmkt:xx,latmkt:xx,accuracy:xx,timestamp:xx,speed:xx}
//let geoCoordInfo = null;

//每次蓝牙最多更新距离，为惯导基础步长
//let flag_beacon_surround = false;
let count_no_beacon = 0;
let last_pdr_update_time = 0;
let count_change_floor = 0;
let count_beacon_enhance = 0;
let count_beacon_locate = 0;
let time_last_count_beacon_enhance = 0;
let time_last_count_beacon_locate = 0;
let time_last_count_change_floor = 0;
let flag_swinging = false;


//强制蓝牙位置更新标识
let flag_correntbyBLE = true;
let flag_correntbyGPS = true;


let last_gps_update_time = 0;
let last_update_sign = "";

let rssiChangeFloor = -85;
let rssiBeaconLocate1 = -65;
let rssiThresholdBeaconLocateFirst = 6;
let rssiThresholdBeaconLocate = 8;
let rssiBeaconLocate3 = -80;
let timeThresholdChangeFloor = 3;
let rssiThresholdBeaconToGps = -75;
let numberBeaconToGps = 10;
let rssiBeaconArround = -82;

//蓝牙纠偏的三个距离
let lengthBeaconCorrect1 = 0.7;
let lengthBeaconCorrect2 = 0.5;
let lengthBeaconCorrect3 = 0.3;

//蓝牙纠偏的强度
let rssiBeaconCorrect1 = -66;
let rssiBeaconCorrect2 = -75;
let rssiBeaconCorrect3 = -85;
//更改

let timeThresholdBeaconToGps = 6000;

//扩展蓝牙拉一下，最多拉3.5米
let disThresholdBeaconEnhance = 2;

//蓝牙一下多拉的限制
let lengthBeaconCorrectEnhance1 = 2.5;
let lengthBeaconCorrectEnhance2 = 2.5;
let lengthBeaconCorrectEnhance3 = 1.5;
//更改


//都超过20米直接蓝牙强拉
let disThresholdBeaconLocate = 30; //更改

let rssiBeaconLocate = -72;
let numberBeaconEnhance = 5;


let numberBeaconlocate = 10;
let timeThresholdBeaconPdr = 1200;


let timeThresholdGpsToBeacon = 10000;


// enter the location algorithm
export function enterLocationAlgo() {
    let oridata = getOriginBeaconData();
    let parse_oridata = JSON.parse(oridata);
    bleListener(null, parse_oridata || []);
}

// 设置导航监听函数
export function setNaviListener(type, listener) {


    if (isFunction(listener)) {
        switch (type) {
            case 'motion':
                Motion_Listener = listener; // 主要处理
                break;
            case 'orientation':
                Orientation_Listener = listener; // 方向
                break;
            default:
        }
        return true;
    }

    return false;
}

//获取GPS数据
export function GetGeoCoor(err, data) {
    if (err) {
        console.log("gps异常", err);
        return;
    }
    if (data) {
        LocatebyGPS(data);

    }
}


// 设置惯导起点坐标
export function setInertialCoord(coord) {
    if (isArray(coord)) {
        inertialCoord = coord;

        return true;
    }

    return false;
}

//GPS定位逻辑
function LocatebyGPS(data) {


    //从蓝牙切换到gps定位，需要超过10秒没蓝牙更新，且周围10秒内没有beacon
    if ((Number(new Date().valueOf()) - last_beacon_update_time >= timeThresholdGpsToBeacon && flag_correntbyGPS)
        && floor_id != 4) { //eslint-disable-line

        if (data.accuracy > 29) {
            return;
        }
        var gps_mercator = WGS84ToMercator(data.longitude, data.latitude);

        if (gps_mercator.x <= 1000 || gps_mercator.y <= 1000) {
            return;
        }

        last_gps_update_time = Number(new Date().valueOf());
        last_update_sign = "gps";

        bleLocationResult({coord: [gps_mercator.x, gps_mercator.y], floorId: floor_id}, 2);

    }
}

// 蓝牙数据监听回调方法
function bleListener(err, data) {
    // TODO 把筛序过滤后的 Beacon 数据，传到这里来 data
    console.log("蓝牙数据监听回调方法bleListener===", data);
    if (err) return;
    // console.log("===蓝牙数据监听回调方法cleanBeacons===",beacons);
    const beacons = cleanBeacons(data);
    const beaconLength = beacons.length;
    if (beaconLength <= 0) {
        count_no_beacon++;
        if (count_no_beacon >= numberBeaconToGps) {
            flag_correntbyGPS = true;
        }
        return;
    }

    let firstBeacon = beacons[0];

    let update_floor_id = floor_id;

    //判断楼层
    if (firstBeacon.rssi >= rssiChangeFloor) {
        if (beacons.length == 1) { //eslint-disable-line
            update_floor_id = beacons[0].floorId;
            // if (inertialCoord == null) {
            //     update_floor_id = beacons[0].floorId;
            // } else {
            //     let current_coor_mercator = {
            //         x: inertialCoord[0],
            //         y: inertialCoord[1]
            //     };
            //     let beacon_coor_mercator = {
            //         x: firstBeacon.lng,
            //         y: firstBeacon.lat
            //     };
            //     if (getDistance(current_coor_mercator,beacon_coor_mercator) <= 20) {
            //         update_floor_id = beacons[0].floorId;
            //     }
            //}
        } else if (beacons.length == 2) { //eslint-disable-line
            if (beacons[0].floorId == beacons[1].floorId && (beacons[0].rssi - beacons[1].rssi >= 8)) { //eslint-disable-line
                update_floor_id = beacons[0].floorId;
                // if (inertialCoord == null) {
                //     update_floor_id = beacons[0].floorId;
                // } else {
                //     let current_coor_mercator = {
                //         x: inertialCoord[0],
                //         y: inertialCoord[1]
                //     };
                //     let beacon_coor_mercator = {
                //         x: firstBeacon.lng,
                //         y: firstBeacon.lat
                //     };
                //     if (getDistance(current_coor_mercator,beacon_coor_mercator) <= 20) {
                //         update_floor_id = beacons[0].floorId;
                //     }
                // }
            }
        } else {
            if (beacons[0].floorId == beacons[1].floorId && beacons[0].floorId == beacons[2].floorId) { //eslint-disable-line
                update_floor_id = beacons[0].floorId;
                // if (inertialCoord == null) {
                //     update_floor_id = beacons[0].floorId;
                // } else {
                //     let current_coor_mercator = {
                //         x: inertialCoord[0],
                //         y: inertialCoord[1]
                //     };
                //     let beacon_coor_mercator = {
                //         x: firstBeacon.lng,
                //         y: firstBeacon.lat
                //     };
                //     if (getDistance(current_coor_mercator,beacon_coor_mercator) <= 20) {
                //         update_floor_id = beacons[0].floorId;
                //     }
                // }
            }
        }
    }


    //当前找到的楼层变了，就加1，下一秒进来还变，继续加1，不然就清零。直到连续3秒都变，就切楼层
    if (update_floor_id != floor_id) { //eslint-disable-line
        count_change_floor++;
        if (new Date().valueOf() - time_last_count_change_floor >= 2000) {
            count_change_floor = 0;
        }
        time_last_count_change_floor = new Date().valueOf();
    } else {
        count_change_floor = 0;
    }

    if (count_change_floor >= timeThresholdChangeFloor) {
        floor_id = update_floor_id;
        count_change_floor = 0;
    }

    let beacons_filter = [];
    beacons_filter = beacons;

    // //过滤出本层beacon
    // let beacons_filter = [];
    // for (let i=0 ; i<= beacons.length - 1; i++) {
    //     if (beacons[i].floorId == floor_id) { //eslint-disable-line
    //         beacons_filter.push(beacons[i]);
    //     }
    // }

    if (beacons_filter.length <= 0) {
        count_no_beacon++;
        if (count_no_beacon >= 10) {
            flag_correntbyGPS = true;
        }
        return;
    }

    firstBeacon = beacons[0];

    if (firstBeacon.rssi >= rssiBeaconArround) {
        flag_correntbyGPS = false;
    }
    count_no_beacon = 0;

    //上一次是gps定位，如果当前没有较强的蓝牙，并且6秒内有过gps更新，则不切到蓝牙
    if (last_update_sign == "gps") { //eslint-disable-line
        if (firstBeacon.rssi <= rssiThresholdBeaconToGps && (Number(new Date().valueOf()) - last_gps_update_time <= timeThresholdBeaconToGps)) {
            return;
        }
    }


    if (flag_correntbyBLE) {
        // console.log(beacons);

        count_beacon_locate = 0;

        //蓝牙太弱就不走蓝牙定位逻辑
        if (firstBeacon.rssi <= rssiBeaconLocate3) {
            return;
        }

        // 有一个蓝牙信号大于阈值则直接定位
        if (firstBeacon.rssi >= rssiBeaconLocate1) {
            console.log("蓝牙强制更新1");
            last_update_sign = "beacon";
            bleLocationResult({coord: [firstBeacon.lng, firstBeacon.lat], floorId: firstBeacon.floorId}, 1);
            // console.log(beacons);
        } else if (beacons_filter.length >= 2) {
            const secondBeacon = beacons_filter[1];
            // 有多个蓝牙信号，且第一个比第二个信号值大于一定值，则直接定位
            if (firstBeacon.rssi >= rssiBeaconLocate3 && firstBeacon.rssi - secondBeacon.rssi >= rssiThresholdBeaconLocateFirst) {
                console.log("蓝牙强制更新2");
                last_update_sign = "beacon";
                bleLocationResult({coord: [firstBeacon.lng, firstBeacon.lat], floorId: floor_id}, 2);
            } else if (secondBeacon.rssi >= rssiBeaconLocate3 && firstBeacon.rssi - secondBeacon.rssi <= rssiThresholdBeaconLocate) {
                let lng = (firstBeacon.lng + secondBeacon.lng) / 2;
                let lat = (firstBeacon.lat + secondBeacon.lat) / 2;
                console.log("蓝牙强制更新3");
                last_update_sign = "beacon";
                bleLocationResult({coord: [lng, lat], floorId: floor_id}, 2);
            } else if (beacons_filter.length >= 3 && secondBeacon.rssi >= rssiBeaconLocate3 && firstBeacon.rssi - beacons_filter[2].rssi <= rssiThresholdBeaconLocate) {
                let lng = 1 / 3 * firstBeacon.lng + 1 / 3 * secondBeacon.lng + 1 / 3 * beacons_filter[2].lng;
                let lat = 1 / 3 * firstBeacon.lat + 1 / 3 * secondBeacon.lat + 1 / 3 * beacons_filter[2].lat;
                console.log("蓝牙强制更新4");
                last_update_sign = "beacon";
                bleLocationResult({coord: [lng, lat], floorId: floor_id}, 2);
            } else {
                notify.show('当前信号弱', 'warning');
                // notify.show('不在服务区，请至国展', 'warning');
                const subBeacons = beacons.slice(0, 4);
                const sum = subBeacons.reduce((sum, beacon) => (sum + beacon.accuracy), 0);

                let lng = 0;
                let lat = 0;

                // 按比例计算坐标
                for (let i = 0, ii = subBeacons.length; i < ii; i++) {
                    const beacon = subBeacons[i];
                    const ratio = beacon.accuracy / sum;

                    lng += beacon.lng * ratio;
                    lat += beacon.lat * ratio;
                }
                console.log("蓝牙强制更新5");
                last_update_sign = "beacon";
                bleLocationResult({coord: [lng, lat], floorId: floor_id}, 3);
                // console.log(beacons);
            }
        }

    } else {
        // console.log(i=7);
        // console.log(beacons);
        //根据RSSI和蓝牙距离更新当前位置

        //惯导更新超过5秒就不执行蓝牙逻辑
        if (Number(new Date().valueOf() - last_pdr_update_time >= timeThresholdBeaconPdr)) {
            if (!flag_swinging) {
                return;
            }
        }

        let strongest_beacon = beacons_filter[0];//最强的beacon

        let current_coor_mercator = {
            x: inertialCoord[0],
            y: inertialCoord[1]
        };
        let beacon_coor_mercator = {
            x: strongest_beacon.lng,
            y: strongest_beacon.lat
        };

        // if (beacon_locate_count >= 5) {
        //         //     flag_correntbyBLE = true;
        //         //     return;
        //         // }


        if (beacons_filter.length >= 4) {
            let beacon_coor_mercator1 = {
                x: beacons_filter[1].lng,
                y: beacons_filter[1].lat
            };
            let beacon_coor_mercator2 = {
                x: beacons_filter[2].lng,
                y: beacons_filter[2].lat
            };
            let beacon_coor_mercator3 = {
                x: beacons_filter[3].lng,
                y: beacons_filter[3].lat
            };

            //当前强的4个蓝牙距离当前位置较远，就加1，下一秒还远，继续加1，不然就清零。直到连续2秒都大，就扩大蓝牙纠偏距离
            if (getDistance(current_coor_mercator, beacon_coor_mercator) >= disThresholdBeaconEnhance &&
                getDistance(current_coor_mercator, beacon_coor_mercator1) >= disThresholdBeaconEnhance &&
                getDistance(current_coor_mercator, beacon_coor_mercator2) >= disThresholdBeaconEnhance &&
                getDistance(current_coor_mercator, beacon_coor_mercator3) >= disThresholdBeaconEnhance) {
                count_beacon_enhance++;
                if (Number(new Date().valueOf()) - time_last_count_beacon_enhance >= 2000) {
                    count_beacon_enhance = 0;
                }
                time_last_count_beacon_enhance = Number(new Date().valueOf());
            }

            //当前强的4个蓝牙距离当前位置很远，并且有一个很强的蓝牙，就加1，下一秒还远，继续加1，不然就清零。直到连续5秒都远，就蓝牙定位一次
            if (getDistance(current_coor_mercator, beacon_coor_mercator) >= disThresholdBeaconLocate &&
                getDistance(current_coor_mercator, beacon_coor_mercator1) >= disThresholdBeaconLocate &&
                getDistance(current_coor_mercator, beacon_coor_mercator2) >= disThresholdBeaconLocate &&
                getDistance(current_coor_mercator, beacon_coor_mercator3) >= disThresholdBeaconLocate &&
                strongest_beacon.rssi >= rssiBeaconLocate) {
                count_beacon_locate++;
                if (Number(new Date().valueOf()) - time_last_count_beacon_locate >= 2000) {
                    count_beacon_locate = 0;
                }
                time_last_count_beacon_locate = Number(new Date().valueOf());
                return;
            }
        }
        let update_length1 = lengthBeaconCorrect1;
        let update_length2 = lengthBeaconCorrect2;
        let update_length3 = lengthBeaconCorrect3;

        if (count_beacon_enhance >= numberBeaconEnhance) {
            update_length1 = lengthBeaconCorrectEnhance1;
            update_length2 = lengthBeaconCorrectEnhance2;
            update_length3 = lengthBeaconCorrectEnhance3;
            count_beacon_enhance = 0;
        }

        if (flag_swinging) {
            update_length1 = lengthBeaconCorrectEnhance1;
            update_length2 = lengthBeaconCorrectEnhance2;
            update_length3 = lengthBeaconCorrectEnhance3;
        }

        if (count_beacon_locate >= numberBeaconlocate) {
            flag_correntbyBLE = true;
            return;
        }

        let distance = getDistance(current_coor_mercator, beacon_coor_mercator);


        if (strongest_beacon.rssi >= rssiBeaconCorrect3) {

            //根据蓝牙信标，限制最多拉取距离，多种拉取逻辑
            if (strongest_beacon.rssi >= rssiBeaconCorrect1) {
                console.log("强制更新");
                last_update_sign = "beacon";
                if (distance <= update_length1) {
                    bleLocationResult({coord: [beacon_coor_mercator.x, beacon_coor_mercator.y], floorId: floor_id}, 4);
                    // console.log(beacons);
                } else {
                    //向量计算新坐标
                    let update_length = update_length1;
                    let update_coor_mercator_x = current_coor_mercator.x + (beacon_coor_mercator.x - current_coor_mercator.x) / distance * update_length;
                    let update_coor_mercator_y = current_coor_mercator.y + (beacon_coor_mercator.y - current_coor_mercator.y) / distance * update_length;
                    // let update_coor_WGS84 = MercatorToWGS84(update_coor_mercator_x,update_coor_mercator_y);
                    let update_coor_WGS84 = {
                        lng: update_coor_mercator_x,
                        lat: update_coor_mercator_y
                    }
                    // console.log("向量计算新坐标-----");
                    // console.log(update_coor_WGS84);
                    bleLocationResult({coord: [update_coor_WGS84.lng, update_coor_WGS84.lat], floorId: floor_id}, 5);
                    // console.log(beacons);
                }
                last_beacon = strongest_beacon.minor;
                last_beacon_update_time = Number(new Date().valueOf());
                last_strong_update_time = Number(new Date().valueOf());
            } else if (strongest_beacon.rssi >= rssiBeaconCorrect2) {
                console.log("半更新");
                last_update_sign = "beacon";
                if (distance <= update_length2) {
                    bleLocationResult({coord: [beacon_coor_mercator.x, beacon_coor_mercator.y], floorId: floor_id}, 4);
                    // console.log(beacons);
                } else {
                    //向量计算新坐标
                    let update_length = update_length2;
                    let update_coor_mercator_x = current_coor_mercator.x + (beacon_coor_mercator.x - current_coor_mercator.x) / distance * update_length;
                    let update_coor_mercator_y = current_coor_mercator.y + (beacon_coor_mercator.y - current_coor_mercator.y) / distance * update_length;
                    // let update_coor_WGS84 = MercatorToWGS84(update_coor_mercator_x,update_coor_mercator_y);
                    let update_coor_WGS84 = {
                        lng: update_coor_mercator_x,
                        lat: update_coor_mercator_y
                    }
                    // console.log("向量计算新坐标-----");
                    // console.log(update_coor_WGS84);
                    bleLocationResult({coord: [update_coor_WGS84.lng, update_coor_WGS84.lat], floorId: floor_id}, 5);
                    // console.log(beacons);
                }
                last_beacon = strongest_beacon.minor;
                last_beacon_update_time = Number(new Date().valueOf());

            } else {
                console.log("弱更新");
                last_update_sign = "beacon";
                if (distance <= update_length3) {
                    bleLocationResult({coord: [beacon_coor_mercator.x, beacon_coor_mercator.y], floorId: floor_id}, 4);
                    // console.log(beacons);
                } else {
                    //向量计算新坐标
                    let update_length = update_length3;
                    let update_coor_mercator_x = current_coor_mercator.x + (beacon_coor_mercator.x - current_coor_mercator.x) / distance * update_length;
                    let update_coor_mercator_y = current_coor_mercator.y + (beacon_coor_mercator.y - current_coor_mercator.y) / distance * update_length;
                    // let update_coor_WGS84 = MercatorToWGS84(update_coor_mercator_x,update_coor_mercator_y);
                    let update_coor_WGS84 = {
                        lng: update_coor_mercator_x,
                        lat: update_coor_mercator_y
                    }
                    // console.log("向量计算新坐标-----");
                    // console.log(update_coor_WGS84);
                    bleLocationResult({coord: [update_coor_WGS84.lng, update_coor_WGS84.lat], floorId: floor_id}, 5);
                    // console.log(beacons);
                }
                last_beacon = strongest_beacon.minor;
                last_beacon_update_time = Number(new Date().valueOf());
            }

        }

    }


    // console.log('ble', data, data.length, beacons, beaconLength);
}


// WGS84坐标转换为墨卡托坐标
function WGS84ToMercator(lng, lat) {
    let PI = Math.PI;
    let x = lng * 20037508.342789 / 180;
    let y = Math.log(Math.tan((90 + lat) * PI / 360)) / (PI / 180);
    y = y * 20037508.34789 / 180;
    return {x, y};
}

// WGS84坐标转换为墨卡托坐标
function MercatorToWGS84(x, y) {
    let merX = x;
    let merY = y;
    let lng = merX / 20037508.34 * 180;
    let lat = merY / 20037508.34 * 180;
    lat = 180 / Math.PI
        * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);

    return {lng, lat};
}

/**判断是否在围栏内（鸟巢范围内）
 * x范围 12956331.14 12956399.76
 y范围 4864584.15 4864715.37
 * @param lngmkt 墨卡托经度
 * @param  latmkt 墨卡托纬度
 * @returns {boolean}
 */
export function isInBirdNest(lngmkt, latmkt) {
    return (latmkt > 4864584.15 && latmkt < 4864715.37) && (lngmkt > 12956331.14 && lngmkt < 12956399.76);
}

// 计算两点的距离
function getDistance(point1, point2) {
    if (!point1 || !point2) {
        return -1;
    }
    let dx = point1.x - point2.x;
    let dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// 蓝牙定位结果回调
function bleLocationResult(eventData, i) {
    // console.log("====蓝牙标签结果回调====",i,inertialCoord);
    // 更新用于惯导计算的起点坐标
    console.log("新楼层" + eventData.floorId);

    inertialCoord = eventData.coord;
    floor_id = eventData.floorId;
    // 移动事件回调
    Motion_Listener(null, eventData);

    flag_correntbyBLE = false;

    // 仅回调一次
    if (BLE_Location_Listener) {
        BLE_Location_Listener(eventData);
        BLE_Location_Listener = null;
    }
}

// 开始导航，监听方向、重力计数据
// startCoord = [lng, lat]
export function startNavigation(startCoord) {
    let compassValue = 0;

    inertialCoord = startCoord;
    initialCompass(function (err, data) {
        if (err) {
            Orientation_Listener({
                type: 'DeviceOrientation',
                error: err
            });
            return;
        }

        compassValue = data;
        Orientation_Listener(null, data);
    });
    initialPedometer(function (err, data) {
        if (err) {
            Motion_Listener({
                type: 'DeviceMotion',
                error: err
            });
            return;
        }

        // 比较得出用户走了一步以上，才计算下一个坐标
        // 减轻计算量
        if (inertialCoord && data.step == 1) { //eslint-disable-line
            flag_swinging = false;
            // inertialCoord = GeoUtil.nextCoord(inertialCoord, compassValue, data.walkingLength);
            //wgs84
            var ic_wgs84 = MercatorToWGS84(inertialCoord[0], inertialCoord[1]);
            inertialCoord = GeoUtil.nextCoord([ic_wgs84.lng, ic_wgs84.lat], compassValue, data.walkingLength);
            //mercator
            var ic_mercator = WGS84ToMercator(inertialCoord[0], inertialCoord[1]);
            inertialCoord = [ic_mercator.x, ic_mercator.y];
            // inertialCoord[0]= data.walkingLength * Math.sin(compassValue/180*Math.PI);
            // inertialCoord[1]= data.walkingLength * Math.cos(compassValue/180*Math.PI);
            last_pdr_update_time = Number(new Date().valueOf());
            Motion_Listener(null, {coord: inertialCoord, floorId: floor_id});
        } else if (data.step == 2) { //eslint-disable-line
            flag_swinging = true;
        } else if (data.step == 3) { //eslint-disable-line
            flag_swinging = false;
            console.log("结束");
            flag_correntbyBLE = true;
        }
    });
    // 蓝牙数据回调，专门处理蓝牙数据
    setBLEListener(bleListener);
}

// 停止导航
export function stopNavigation() {
    destroyCompass();
    destroyPedometer();
    unsetBLEListener(bleListener);
}

// 通过蓝牙定位
export function locateByBLE(listener) {
    // 蓝牙数据回调，专门处理蓝牙数据
    setBLEListener(bleListener);
    flag_correntbyBLE = true;

    if (isFunction(listener)) BLE_Location_Listener = listener;
}

// 取消蓝牙定位
export function cancelBLELocation() {
    BLE_Location_Listener = null;
}
