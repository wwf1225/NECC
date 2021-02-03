// 版本号
export const AppVersion = process.env.REACT_APP_APP_VERSION;

// 路径
export const PublicUrl = process.env.PUBLIC_URL;


export const App_ID = 'wx052d648a9a10fb59';

//后台请求url，默认使用代理
export const BaseUrl = '';  // 发布线上
// export const BaseUrl = '/xcxdev'; // 本地

// 本地
// export const baseWebsocketUrl = 'wss://testapi.naviguy.com:3344';
// 线上
export const baseWebsocketUrl = 'wss://testapi.naviguy.com';
// export const baseWebsocketUrl = 'wss://testapi.naviguy.com';
// export const baseWebsocketUrl = 'wss://naviguy.ciie.org:3344';


//地图定义
// export const MapId = '12e6a0f0-50b0-4344-92ea-ccc497f505d0'; // 鸟巢区域uuid
export const MapId = 'e7d31e40-b88e-40ce-b000-f18012c4d567'; // 国展

// export const AppCode = 'gzjbh_201911';
export const AppCode = 'gzjbh_202011';

// 登录参数
export const AppType = "20bc6effc2eb5c3ba3deafb6d5f8ab41";


//静态文件
export const StaticUrl = `${PublicUrl}/static/v1`;


//鸟巢
export const MapOptions = {
    mapServerURL: `${StaticUrl}/data/neccTile/`, //  国展地图x数据本地路径
    mapThemeURL: `${StaticUrl}/data/neccTheme/`, //  国展地图样式本地路径
    // fmapID : 'wx-gz201801',
    fmapID: 'necc-exhibition',
    fmapAppName: "上海测试Demo",
    // fmapDefaultThemeName: "wx-gz201801",
    fmapDefaultThemeName: "necc-exhibition",
    fmapKey: "487d62361519d6cdec1a051368f84fa7",
    fmapScaleLevelRange: [16, 20],
    fmapDefaultVisibleGroups: [2],
    fmapDefaultFocusGroup: 2,
    fmaDefaultMapScaleLevel: 16
}


//导航时参数
export const NaviOptions = {
    //距离终点的最大距离，结束导航 单位：米
    maxEndDistance: 5,
    //路径偏移的最大距离，单位：米
    maxOffsetDis: 15,
    //路径偏移的最小距离，在最小距离以内坐标点自动约束到路径线上
    minOffsetDis: 3,
    //导航过程中地图缩放比例
    naviScaleLevel: 21
}


// 是否规定只能在小程序环境下调用
export const shouldMiniAppEnv = process.env.NODE_ENV === 'development' ? true : false;

export let  sliderHeight = "";
