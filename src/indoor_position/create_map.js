/**
 * 创建fengmap地图
 * */
import {MapOptions} from "../utils/config";

const fengmap = window.fengmap;

let mapInstance = null;

export default function () {
    var mapOpts = {
        container: document.getElementById('map'), // 渲染dom
        appName: MapOptions.fmapAppName,
        defaultVisibleGroups: MapOptions.fmapDefaultVisibleGroups,           //设置初始显示楼层，数组格式，可单个，可多个
        defaultThemeName: MapOptions.fmapDefaultThemeName,
        key: MapOptions.fmapKey, // 开发者申请应用下web服务的key
        defaultFocusGroup: MapOptions.fmapDefaultFocusGroup, // 初始聚焦楼层,默认1
        defaultViewMode:fengmap.FMViewMode.MODE_2D, //初始二维还是三维状态，三维状态为MODE_3D
        tile:  true,
        mapScaleLevelRange: MapOptions.fmapScaleLevelRange,
        defaultMapScaleLevel: MapOptions.fmaDefaultMapScaleLevel,//设置地图初始显示比例尺级别。范围为1-29之间的整数值。如29级的比例尺为1:1厘米。
        mapServerURL: MapOptions.mapServerURL + MapOptions.fmapID, // 地图数据本地路径
        mapThemeURL:  MapOptions.mapThemeURL, // 地图样式本地路径
        defaultControlsPose: -31,
        modelSelectedEffect: false,
        defaultViewCenter: {x:13502763.66374543,y:3657684.0809}

    };
    const map = new fengmap.FMMap(mapOpts);

    mapInstance = map;

    return map;
};

// 获取地图对象
export function getMapInstance() {
    return mapInstance;
}
