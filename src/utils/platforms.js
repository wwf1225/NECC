// 检查平台

const platforms = {
    WindowsPhone: false,
    Android: false,
    IOS: false
};

(function checkPlatforms() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        platforms.WindowsPhone = true;
    } else if (/android/i.test(userAgent)) {
        platforms.Android = true;
    } else if (/iPad|iPhone|iPod/i.test(userAgent) && !window.MSStream) {
        // iOS detection from: http://stackoverflow.com/a/9039885/177710
        platforms.IOS = true;
    }
})();

// 判断是否是Android平台
export function isAndroid() {
    return platforms.Android;
}

// 判断是否是iOS平台
export function isIOS() {
    return platforms.IOS;
}

export default platforms;
