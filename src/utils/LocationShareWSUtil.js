// 位置共享 websocket 封装

import {AppCode, AppType, MapId, baseWebsocketUrl} from "./config";
import LocalCache from "./storage_cache";

var locationShareWS = null;
var POI = LocalCache.get('poi_positonshare');


// 查询问题
var INQUERY_QUESTION_TYPE = "";
// 询问回调
var INQUERY_CALLBACK = null;

// 加入房间的回调
var JOIN_ROOM_CALLBACK = null;

// 更新位置的回调
var UPDATE_LOCATION_CALLBACK = null;

// 退出房间的回调
var EXIT_ROOM_CALLBACK = null;

// 错误回调
var ERROR_CALLBACK = null;




/**
 * 初始化 位置共享 websocket
 */
export function initLocationShareWS(callback) {
    let self = this;
    console.log("initLocationShareWS ...");
    if (locationShareWS !== null) {
        console.error('locationShareWS !== null')
        locationShareWS.close();
        locationShareWS = null;
    }
    if ("WebSocket" in window) {
        console.log("您的浏览器支持 WebSocket!");
        // alert("您的浏览器支持 WebSocket!");
        // 打开一个 web socket
        locationShareWS = new WebSocket(baseWebsocketUrl + "/manage/websocket/RealTimeShareLocation");
        locationShareWS.onmessage = function (evt) {
            var res = JSON.parse(evt.data);
            console.log("websocket收到数据: ", res);


            if(res.code !== 0) {
                console.log('错误==',res);
                if (ERROR_CALLBACK != null) {
                    ERROR_CALLBACK(res); // 错误回调
                    ERROR_CALLBACK = null;
                }
            }

            if (res.code == 0 && res.extraData == 'CREATE_ROOM') {
                console.log("在这里处理创建房间完成后的逻辑");

                callback(res); // 回调函数传参
                updateLocationData();

                // var timer1 = setInterval(() => {
                //     updateLocationData();
                // }, 3000);
                // LocalCache.set('timer1', timer1);

            } else if (res.code == 0 && res.extraData == 'JOIN_ROOM') {
                console.log('加入房间逻辑');
                if (JOIN_ROOM_CALLBACK != null) {
                    JOIN_ROOM_CALLBACK(res);
                    JOIN_ROOM_CALLBACK = null;
                }


            } else if (res.code == 0 && res.extraData == "UPDATE_USERS_LOCATIONS") {
                console.log('更新位置逻辑', res);
                if (UPDATE_LOCATION_CALLBACK != null) {
                    UPDATE_LOCATION_CALLBACK(res);
                    UPDATE_LOCATION_CALLBACK = null;
                }
                // var timer2 = setInterval(() => {
                //     if (UPDATE_LOCATION_CALLBACK != null) {
                //         UPDATE_LOCATION_CALLBACK(res);
                //         UPDATE_LOCATION_CALLBACK = null;
                //     }
                // }, 1500);
                // LocalCache.set('timer2', timer2);

            } else if (res.code == 0 && res.extraData == 'INQUIRY') {
                console.log('询问房间信息==', res);

                switch (INQUERY_QUESTION_TYPE) {
                    case "ROOM_INFO":
                        // todo =========================

                        break;
                    case "PASSWORD_REQUIRED":

                        break;
                    case "LAST_CAN_USE_ROOM_INFO":

                        break;
                }
                // callback(res); // 回调函数传参   这样回调传参会报错，使用下面的回调，如果有回调函数就调用，没有就为null
                // 询问，如果有回调函数，就调用
                if (INQUERY_CALLBACK != null) {
                    INQUERY_CALLBACK(res);
                    INQUERY_CALLBACK = null;
                }

            } else if (res.code == 0 && res.extraData == 'EXIT_ROOM') {
                console.log('退出房间逻辑', locationShareWS);
                let timer3 = LocalCache.get('timer3');
                clearInterval(timer3);
                if (EXIT_ROOM_CALLBACK != null) {
                    EXIT_ROOM_CALLBACK(res);
                    EXIT_ROOM_CALLBACK = null;
                }
                if (locationShareWS !== null) {
                    locationShareWS.close();
                    locationShareWS = null;
                }
                console.error('退出房间111');

            } else if (res.code == 0 && res.extraData == 'INQUIRY_LAST') {
                console.log('最后加入房间信息逻辑');
                // callback(res.data[0]); // 回调函数传参
            } else {
                console.log("==============> 位置共享失败数据注意 <=================");

            }

        };

        locationShareWS.onclose = function () {
            // 关闭 websocket
            console.log("连接已关闭...");
        };
    } else {
        // 浏览器不支持 WebSocket
        alert("您的浏览器不支持 WebSocket!");
    }
    console.log("位置共享ws初始化完成");
}


/*
* 错误回调
* */

export function errorCallback(callback) {
    ERROR_CALLBACK = typeof callback == "function" ? callback : null;
}

/**
 * 更新位置信息
 */
export function updateLocationData(callback) {
    // Web Socket 已连接上，使用 send() 方法发送数据
    UPDATE_LOCATION_CALLBACK = typeof callback == "function" ? callback : null;
    locationShareWS.send(JSON.stringify({
        "operationType": "UPDATE_LOCATION",
        "operationParams": {
            "unid": LocalCache.get("userInfo").userUuid,
            "x": POI.x,
            "y": POI.y,
            "z": POI.z,
            "groupid": POI.groupid,
            "venueuuid": MapId,
            "appcode": AppCode,
            "apptype": AppType
        },
        "extraData": "UPDATE_USERS_LOCATIONS"
    }));
}

/**
 * 查询房间信息
 */
export function queryRoomInfo(roomId, INQUERY_QUESTION_TYPE, callback) {
    initLocationShareWS(typeof callback == "function" ? callback : null);
    locationShareWS.onopen = function () {
        // Web Socket 已连接上，使用 send() 方法发送数据
        INQUERY_CALLBACK = typeof callback == "function" ? callback : null;
        // INQUERY_QUESTION_TYPE = "ROOM_INFO";
        var operationParams = {};

        if (INQUERY_QUESTION_TYPE == "ROOM_INFO") {
            operationParams = {
                "queryType": "ROOM_INFO",
                "inqueryReqParams": {
                    "unid": LocalCache.get("userInfo").userUuid,
                    "venueuuid": MapId,
                    "appcode": AppCode,
                    "apptype": AppType,
                    "roomid": roomId
                }
            }

        } else if (INQUERY_QUESTION_TYPE == "LAST_CAN_USE_ROOM_INFO") {
            operationParams = {
                "queryType": "LAST_CAN_USE_ROOM_INFO",
                "inqueryReqParams": {
                    "unid": LocalCache.get("userInfo").userUuid,
                    "venueuuid": MapId,
                    "appcode": AppCode,
                    "apptype": AppType
                }
            }
        }
        locationShareWS.send(JSON.stringify({
            // "operationType": "INQUIRY",
            // "operationParams": {
            //     "queryType": "ROOM_INFO",
            //     "inqueryReqParams": {
            //         "unid": "196eeac94095a5dd8321d07d97068edb",
            //         "venueuuid": MapId,
            //         "appcode": AppCode,
            //         "apptype": AppType,
            //         "roomid": roomId
            //     }
            // },
            // "extraData": "INQUIRY"

            "operationType": "INQUIRY",
            "operationParams": operationParams,
            "extraData": "INQUIRY"
        }));
    }
}

/**
 * 查询最后可用的房间信息
 */
export function queryLastCanUseRoomInfo() {
    // Web Socket 已连接上，使用 send() 方法发送数据
    locationShareWS.send(JSON.stringify({
        "operationType": "INQUIRY",
        "operationParams": {
            "queryType": "LAST_CAN_USE_ROOM_INFO",
            "inqueryReqParams": {
                "unid": LocalCache.get("userInfo").userUuid,
                "venueuuid": MapId,
                "appcode": AppCode,
                "apptype": AppType,
            }
        },
        "extraData": "INQUIRY_LAST"
    }));
}


/**
 * 询问
 */
export function inqueryLocationInfo() {
    let roomId = document.getElementById('roomId').value;
    // Web Socket 已连接上，使用 send() 方法发送数据
    locationShareWS.send(JSON.stringify({
        "operationType": "INQUIRY",
        "operationParams": {
            "queryType": "ROOM_INFO",
            "inqueryReqParams": {
                "unid": LocalCache.get("userInfo").userUuid,
                "venueuuid": MapId,
                "appcode": AppCode,
                "apptype": AppType,
                "roomid": roomId
            }
        },
        "extraData": "INQUIRY"
    }));
}

/**
 * 创建房间
 */
export function createRoom(callback) {
    initLocationShareWS(typeof callback == "function" ? callback : null);
    locationShareWS.onopen = function () {
        // Web Socket 已连接上，使用 send() 方法发送数据
        locationShareWS.send(JSON.stringify({
            "operationType": "CREATE_ROOM",
            "operationParams": {
                "unid": LocalCache.get("userInfo").userUuid,
                "x": POI.x,
                "y": POI.y,
                "z": POI.z,
                "groupid": POI.groupid,
                "venueuuid": MapId,
                "appcode": AppCode,
                "apptype": AppType
            },
            "extraData": "CREATE_ROOM"
        }));
        // alert("数据发送中...");
    };
}

/**
 * 加入房间
 */
export function joinRoom(roomId, callback) {
    // locationShareWS.onopen = function () {
    // Web Socket 已连接上，使用 send() 方法发送数据
    JOIN_ROOM_CALLBACK = typeof callback == "function" ? callback : null;
    // queryRoomInfo(typeof callback == "function" ? callback : null);
    locationShareWS.send(JSON.stringify({
        "operationType": "JOIN_ROOM",
        "operationParams": {
            "unid": LocalCache.get("userInfo").userUuid,
            "x": POI.x,
            "y": POI.y,
            "z": POI.z,
            "groupid": POI.groupid,
            "venueuuid": MapId,
            "appcode": AppCode,
            "apptype": AppType,
            "roomId": roomId
        },
        "extraData": "JOIN_ROOM"
    }));
    // alert("数据发送中...");
    // };
}

/**
 * 退出房间
 */
export function exitRoom(callback) {
    EXIT_ROOM_CALLBACK = typeof callback == "function" ? callback : null;
    // Web Socket 已连接上，使用 send() 方法发送数据
    locationShareWS.send(JSON.stringify({
        "operationType": "EXIT_ROOM",
        "operationParams": {},
        "extraData": "EXIT_ROOM"
    }));

    // locationShareWS.close();
}




