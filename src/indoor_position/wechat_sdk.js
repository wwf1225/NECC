// 微信js sdk

import {getWechatConfig} from "../api/app";
import {isFunction, VOID} from "../utils/util";
import {GetGeoCoor} from "./navigation";
// import {shouldMiniAppEnv} from "../utils/config";

/*
import RecordApp from 'recorder-core/src/app-support/app'
import 'recorder-core/src/app-support/app-ios-weixin-support'


const App = RecordApp;
const platform=App.Platforms.Weixin;
const config=platform.Config;

const win=window.top;//微信JsSDK让顶层去加载，免得iframe各种麻烦
//实现app.js内IOS-Weixin中Config的接口
config.WxReady=function(call){
    //此方法已实现在微信JsSDK wx.config好后调用call(wx,err)函数
    //微信JsSDK wx.config需使用到后端接口进行签名，文档： https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html 阅读：通过config接口注入权限验证配置、附录1-JS-SDK使用权限签名算法
    win.WxReady(call);
};

const wx = window.wx;
const BleListeners = [];

function bleListener(err, data) {
    console.log("==========>监听搜索bleListener函数返回<========",data);
    BleListeners.forEach(function (listener) {
        listener(err, data);
    });
}

// 错误类型
export const ErrorTypes = {
    WECHAT_SDK: 'WechatConfigError',
    START_BLE: 'StartSearchBeaconsFail',
    SEARCH_BLE: 'OnSearchBeaconsFail',
    STOP_BLE: 'StopSearchBeaconsFail'
};

// 设置监听器
export function setBLEListener(listener) {
    // console.log(BleListeners);
    if (isFunction(listener)) {
        // 检查是否存在相同的回调方法，若相同则不添加
        for (let i = 0, ii = BleListeners.length; i < ii; i++) {
            if (BleListeners[i] === listener) {
                return false;
            }
        }

        BleListeners.push(listener);

        return true;
    }
    return false;
}

// 取消监听器
export function unsetBLEListener(listener) {
    for (let i = 0, ii = BleListeners.length; i < ii; i++) {
        const listenerFunc = BleListeners[i];
        if (listenerFunc === listener) {
            BleListeners.splice(i, 1);
            break;
        }
    }
}
 */


// 傳遞過來的原始藍牙數據
let original_beacon_data = [];

// set the original beacon data
export function setOriginBeanconData(dt) {
    original_beacon_data = dt;
}

// get the original beacon data
export function getOriginBeaconData() {
    return original_beacon_data;
}


const wx = window.wx;
const BleListeners = [];

export function bleListener(err, data) {
    console.log("==========>监听搜索bleListener函数返回<========", data, BleListeners);
    BleListeners.forEach(function (listener) {
        listener(err, data);
    });
}

// 错误类型
export const ErrorTypes = {
    WECHAT_SDK: 'WechatConfigError',
    START_BLE: 'StartSearchBeaconsFail',
    SEARCH_BLE: 'OnSearchBeaconsFail',
    STOP_BLE: 'StopSearchBeaconsFail'
};

// 设置监听器
export function setBLEListener(listener) {
    // console.log(BleListeners);
    if (isFunction(listener)) {
        // 检查是否存在相同的回调方法，若相同则不添加
        for (let i = 0, ii = BleListeners.length; i < ii; i++) {
            if (BleListeners[i] === listener) {
                return false;
            }
        }

        BleListeners.push(listener);

        return true;
    }
    return false;
}

// 取消监听器
export function unsetBLEListener(listener) {
    for (let i = 0, ii = BleListeners.length; i < ii; i++) {
        const listenerFunc = BleListeners[i];
        if (listenerFunc === listener) {
            BleListeners.splice(i, 1);
            break;
        }
    }
}

/**
 * 初始化微信sdk
 * @param {Object} options - 方法配置数据，有如下字段：
 * @param {Boolean} options.initBLE - 配置微信SDK成功之后是否马上开启微信蓝牙，默认false，不开启
 * */
export function initialWechatSDK(options) {
    const defaultOpts = {initBLE: true, ...options};
    console.log("defaultOpts", defaultOpts);
    console.error("defaultOpts", defaultOpts);
    const pageUrl = window.location.href.split('#')[0];
    getWechatConfig({
        debug: false,
        url: pageUrl,
        apis: ["startSearchBeacons", "invokeMiniProgramAPI", "stopSearchBeacons", "getLocation", "onMenuShareAppMessage", "onMenuShareTimeline", "onSearchBeacons", "startRecord", "stopRecord", "uploadVoice", "translateVoice"]
    }).then(function (res) {
        console.error("wechat jssdk success res",res);
        if (res.__state) {
            console.error("wechat jssdk success");
            console.log("wechat jssdk success");
            const data = res.data;
            wx.config({
                // 开启调试模式,调用的所有api的返回值会在客户端alert出来，
                // 若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                debug: data.debug,
                appId: data.appId, // 必填，公众号的唯一标识
                timestamp: data.timestamp, // 必填，生成签名的时间戳
                nonceStr: data.nonceStr, // 必填，生成签名的随机串
                signature: data.signature,// 必填，签名
                jsApiList: data.jsApiList// 必填，需要使用的JS接口列表
            });
        }
    });

    let wechatError = null;

    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，
    // config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。
    // 对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
    wx.ready(function () {
        console.error("ready   xxxx!!!!!!!!!!!");
        wx.checkJsApi({
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'startRecord', 'stopRecord', 'uploadVoice', 'translateVoice'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
            success: function (res) {
                console.error("ready  suc  xxxx!!!!!!!!!!!");
                console.error("ready  suc  xxxx!!!!!!!!!!!",res);
                // 以键值对的形式返回，可用的api值true，不可用为false
                // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                // alert(res);

                /*
               RecordApp.AlwaysUseWeixinJS = true;
               const wxOjbK = function (call) {
                       call(wx);
               };
               window.WxReady=function(call){
                       wxOjbK(call);
               };




               console.error(wx);
               RecordApp.Platforms.Weixin.Config.WxReady(function (w,e) {
                   console.error(w);
                   console.error(e);
               })

                */

                /*
                RecordApp.RequestPermission(function(){
                    console.error("RequestPermission 成功");
                },function(err,isUserNotAllow){
                    console.error((isUserNotAllow?"UserNotAllow，":"")+"打开录音失败："+err,1);
                });

                 */

                /*
                                RecordApp.AlwaysUseWeixinJS=true;
                                RecordApp.AlwaysAppUseJS=true;
                //立即加载环境，自动把Recorder加载进来
                                RecordApp.Install(function(){
                                    console.error("RecordApp.Install成功");
                                    RecordApp.RequestPermission(function(){
                                        console.error("RequestPermission 成功");
                                    },function(err,isUserNotAllow){
                                        console.error((isUserNotAllow?"UserNotAllow，":"")+"打开录音失败："+err,1);
                                    });


                                },function(err,isUserNotAllow){
                                    console.error(err);
                                    console.error(isUserNotAllow);

                                });

                 */


            },
            fail: function (res) {
                console.error("^^^^^^^^^^^^^^^!!!!!!!!!!!");
                console.error(res);
            }
        });


        if (wechatError) {
            bleListener({
                type: ErrorTypes.WECHAT_SDK,
                errMsg: wechatError
            });
        } else {


            // wx.hideOptionMenu();
            defaultOpts.initBLE && initialWechatBLE();
            // getShareMessage();
        }
    });
    // config信息验证失败会执行error函数，如签名过期导致验证失败，
    // 具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
    wx.error(function (res) {
        // console.log(res);
        wechatError = res.errMsg;
    });
}

// 初始化摇一摇周边的定时器
let initWechatBLETimer = null;

// 初始化微信摇一摇周边
export function initialWechatBLE(listener) {
    console.log('initialWechatBLE被调用');
    // console.log(listener);

    if (initWechatBLETimer) {
        clearTimeout(initWechatBLETimer);
        initWechatBLETimer = null;
    }
    // 设置回调方法
    setBLEListener(listener);

    // aaaaaaaaaaa
    // 把原始的藍牙標簽數據傳給它
    // setInterval(function () {
    //     let parse_original_beacon_data = JSON.parse(original_beacon_data);
    //     console.log("original_beacon_data", parse_original_beacon_data);
    //     bleListener(null, parse_original_beacon_data || []);
    // }, 1000);

    // aaaaaaaaaaa

    // 初始化之前先销毁一次
    // destroyWechatBLE(function () {
    //     // 开启查找周边ibeacon设备接口
    //     wx.startSearchBeacons({
    //         // 摇周边的业务ticket, 系统自动添加在摇出来的页面链接后面
    //         ticket: "",
    //         // 触发success回调时返回的数据
    //         // 打开成功返回：'startSearchBeacons:ok'
    //         success: function (res) {
    //             bleListener({
    //                 type: ErrorTypes.START_BLE,
    //                 errMsg: res.errMsg
    //             });
    //
    //             // 监听周边ibeacon设备接口
    //             wx.onSearchBeacons({
    //                 // 回调函数，可以数组形式取得该商家注册的在周边的相关设备列表
    //                 success: function (res) {
    //                     console.log("==========>监听搜索成功<========", res);
    //                     bleListener(null, res.beacons || [])
    //                 },
    //                 // 一般可能不会触发该回调
    //                 fail: function (res) {
    //                     // console.log(res);
    //                     console.log("==========>监听搜索失败<========", res);
    //                     bleListener({
    //                         type: ErrorTypes.SEARCH_BLE,
    //                         errMsg: res.errMsg
    //                     });
    //                 }
    //             });
    //         },
    //         // 触发fail回调时返回的数据
    //         // 打开后未stop再次打开 ：'startSearchBeacons:already started'
    //         // 蓝牙未打开返回 ：'startSearchBeacons:bluetooth power off'
    //         // 地理位置服务未打开返回： 'startSearchBeacons:location service disable'
    //         // 系统不支持返回 ：'startSearchBeacons:system unsupported'
    //         fail: function (res) {
    //             bleListener({
    //                 type: ErrorTypes.START_BLE,
    //                 errMsg: res.errMsg
    //             });
    //
    //             // 出现如下错误则循环检测
    //             switch (res.errMsg) {
    //                 case 'startSearchBeacons:bluetooth power off':
    //                 case 'startSearchBeacons:location service disable':
    //                     initWechatBLETimer = setTimeout(function () {
    //                         initialWechatBLE(listener);
    //                     }, 30000);
    //                     break;
    //                 default:
    //             }
    //         }
    //     });
    //
    // });

}

// 获取微信环境
// export function getWxEnv(callback) {
//     if (!isFunction(callback)) {
//         callback = function () {
//         };
//     }

//     if (!shouldMiniAppEnv) {
//         return callback({miniprogram: true});
//     }

//     if (wx.miniProgram) { // 低版本的js sdk不存在该方法，做兼容
//         wx.miniProgram.getEnv(callback);
//     } else {
//         callback({miniprogram: false});
//     }
// }

/**
 * 关闭微信摇一摇
 * @param {(Function|Object)} options - 若传方法，则作为complete的回调方法；若传对象，则允许自定义回调方法
 * @return {undefined}
 * */
export function destroyWechatBLE(options) {
    const opts = isFunction(options)
        ? {success: VOID, fail: VOID, complete: options}
        : {success: VOID, fail: VOID, complete: VOID, ...options};

    // 关闭查找周边设备
    wx.stopSearchBeacons(opts);
}

// 获取地理位置坐标,使用参照的坐标为gcj02
export function getGeoLocation() {
    wx.getLocation({
        success: function (res) {
            // var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
            // var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
            // var speed = res.speed; // 速度，以米/每秒计
            // var accuracy = res.accuracy; // 位置精度
            GetGeoCoor(null, {
                longitude: res.longitude,
                latitude: res.latitude,
                speed: res.speed,
                accuracy: res.accuracy
            });
            //callback(res);
        },
        fail: function (res) {
            GetGeoCoor(res);
        }
    });
}
