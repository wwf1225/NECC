// 指北针
import Platforms from '../utils/platforms';
import {isFunction, VOID} from "../utils/util";

let compassListener = VOID;

function eventHandler(event) {
    let compass = 0;

    if (event.webkitCompassHeading) {
        compass = event.webkitCompassHeading;
    } else {
        compass = 360 - event.alpha;
    }

    compassListener(null, compass);
}

// 初始化指南针，监听指南针事件
// 回调函数，第一个参数是错误事件，第二个参数才是指北针角度
export function initialCompass(listener) {

    setCompassListener(listener);

    // 监听事件
    if (isSupportCompass()) {
        if (Platforms.Android) {
            window.addEventListener("deviceorientationabsolute", eventHandler, true);
        } else {
            window.addEventListener("deviceorientation", eventHandler, true);
        }
    } else {
        compassListener(new Error('当前设备不支持指南针事件'));
    }
}

/**
 * 设置监听事件回调方法
 * @return {Boolean} 设置成功true，否则false
 * */
export function setCompassListener(listener) {
    if (isFunction(listener)) {
        compassListener = listener;
        return true;
    }

    return false;
}

// 停止获取指南针指南针
export function destroyCompass() {
    window.removeEventListener('deviceorientationabsolute', eventHandler, true);
    window.removeEventListener('deviceorientation', eventHandler, true);
}

// 判断是否支持获取方向
export function isSupportCompass() {
    return !!window.DeviceOrientationEvent;
}
