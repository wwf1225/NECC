// 计步器

import {isFunction, VOID} from "../utils/util";
import {isAndroid} from "../utils/platforms";

let xxx = 0;
let yyy = 0;
let zzz = 0;
let dt = 0;
let preTimestamp = 0;
let previousAcc = {x: 0, y: 0, z: 0};
let presentAcc = {x: 0, y: 0, z: 0};
let minPeriod = 400;
let accThS = 0.5;
let last_time = 0;
let ALPHA = 0.2;
let flag_swing =false;
let swing_duration = 0;
let last_swing_time = 0;
let swing_detect_time = 600;
let swing_duration_min = 1;
let flag_swinging = false;
let time_start_swing = 0 ;



export function detectStep(event) {
    // motion_Data 是 event.accelerationIncludingGravity;
    let motion_data = event.accelerationIncludingGravity;

    xxx = xxx + ALPHA * (motion_data.x - xxx);
    yyy = yyy + ALPHA * (motion_data.y - yyy);
    zzz = zzz + ALPHA * (motion_data.z - zzz);

    let line_x = motion_data.x - xxx;
    let line_y = motion_data.y - yyy;
    let line_z = motion_data.z - zzz;
    dt = event.timeStamp - preTimestamp;


    let swing_detect_state=0;
    if (flag_swing) {
        swing_duration = swing_duration +1;
        if (Number(new Date().valueOf())-last_swing_time>=swing_detect_time) {
            flag_swing = false;
            previousAcc = {x: 0, y: 0, z: 0};
            presentAcc = {x: 0, y: 0, z: 0};
            swing_detect_state=1;
        } else {
            previousAcc = {x: 0, y: 0, z: 0};
            presentAcc = {x: 0, y: 0, z: 0};
            swing_detect_state=2;
        }
    }
    if (Math.sqrt(line_x*line_x+line_y*line_y+line_z*line_z)>=6.0) {
        flag_swing = true;
        last_swing_time = Number(new Date().valueOf());
        swing_detect_state=2;
    }

    if (!isAndroid()) {
        if (Math.abs(xxx)>=6 || yyy>=8) {
            flag_swing = true;
            last_swing_time = Number(new Date().valueOf());
            swing_detect_state = 2;
        }
    } else {
        if (Math.abs(xxx)>=6 || yyy<=-8) {
            flag_swing = true;
            last_swing_time = Number(new Date().valueOf());
            swing_detect_state = 2;
        }
    }

    switch (swing_detect_state) {
        case 0:
        {
            let step = 0;
            if (presentAcc.y - previousAcc.y >= 0 && presentAcc.y - line_y >= 0 && dt >= minPeriod && presentAcc.y > accThS) {
                step = 1;
                preTimestamp = event.timeStamp;
            }

            previousAcc.x = presentAcc.x;
            previousAcc.y = presentAcc.y;
            previousAcc.z = presentAcc.z;

            presentAcc.x = line_x;
            presentAcc.y = line_y;
            presentAcc.z = line_z;

            if (step == 1) { //eslint-disable-line
                return 1;
            } else {
                return 0;
            }
        }
        case 1:
            if (swing_duration >= swing_duration_min) {
                swing_duration = 0;
                return 3;
            }else {
                swing_duration = 0;
                return 0;
            }
        case 2:
            return 2;
        default:
            return 0;
    }
}

let stepListener = VOID;

function eventHandler(event) {
    let currentTime = event.timeStamp;
    // 计算步伐，不能太频繁，每隔24ms计算一次
    if (currentTime - last_time <= 24) return;

    last_time = currentTime;

    let oneStep = detectStep(event);

    if (oneStep == 2) { //eslint-disable-line
        if (!flag_swinging) {
            time_start_swing = Number(new Date().valueOf());
            flag_swinging = true;
            oneStep = 2;
        } else {
            if (Number(new Date().valueOf()) - time_start_swing >= 5 * 1000) {
                console.log("甩起来");
                oneStep = 2;
                time_start_swing = Number(new Date().valueOf());
            } else {
                oneStep = 0;
            }
        }

    } else {
        flag_swinging = false;
    }

    stepListener(null, {
        step: oneStep, // 用户走的步数，在0-1步之间
        walkingLength: 0.78 * oneStep // 假设一步的步长固定为0.6m
    });
}

// 初始化计步器
export function initialPedometer(listener) {

    setStepListener(listener);

    if (isSupportPedometer()) {
        window.addEventListener("devicemotion", eventHandler, true);
    } else {
        stepListener(new Error('当前浏览器不支持devicemotion事件'));
    }
}

/**
 * 设置计步器监听器
 * @return {Boolean} true - 设置成功，false - 设置失败
 * */
export function setStepListener(listener) {
    if (isFunction(listener)) {
        stepListener = listener;
        return true;
    }

    return false;
}

/**
 * 停止步伐监听
 * @return {undefined}
 * */
export function destroyPedometer() {
    window.removeEventListener('devicemotion', eventHandler, true);
    last_time = 0;
}

// 判断是否支持计步器
export function isSupportPedometer() {
    return !!window.DeviceMotionEvent;
}
