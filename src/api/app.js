import qwest from 'qwest';
import {AppCode, BaseUrl} from "../utils/config";

qwest.setDefaultOptions({
    dataType: 'json',
    timeout: 60000
});

qwest.base =  BaseUrl;

export function formatResponse(xhr, res) {
    if (!res) {
        return {
            __state: false,
            code: 0,
            message: '没有数据返回'
        };
    } else {
        if (res.code === 0 || res.code ==='0'){
            res.__state = true;
        }else{
            res.__state = false;
        }
    }

    return res;
}

export function formatError(err) {
    return {
        __state: false,
        code: -1,
        message: err
    };
}

//上报数据 不弹框提示超时

// 获取微信js sdk的配置数据
export function getWechatConfig(params) {

    return qwest
        .post('/manage/api/bizbackend/wechat/getHtJsConfig', {
            debug: params.debug || false,
            url: params.url,
            jsApiList: params.apis
        })
        .then(formatResponse)
        .catch(formatError);
}

// 获取蓝牙标签的版本号
export function getBeaconVersion(params) {

    /*
    return qwest
        .post('/manage/api/appclient/appdata/getLabelWechatVersion', {
            venueuuid: params.venueuuid,
            datatype: params.datatype,
            appcode:AppCode
        })
        .then(formatResponse)
        .catch(formatError);

     */

    return doHttpRequest('/manage/api/appclient/appdata/getLabelWechatVersion',{
        venueuuid: params.venueuuid,
        datatype: params.datatype,
    });
}

// 获取所有的beacon数据
export function getBeacons(params) {
    /*
    return qwest
        .post('/manage/api/appclient/appdata/getBleWechatLabelDataIncrement', {
            venueuuid: params.venueuuid,
            curVersion: params.curVersion,
            appcode:AppCode
        },{timeout: 60000})
        .then(formatResponse)
        .catch(formatError);

     */


    return doHttpRequest('/manage/api/appclient/appdata/getBleWechatLabelDataIncrement',{
        venueuuid: params.venueuuid,
        curVersion: params.curVersion,
    },{timeout: 60000})
}

// 上传用户微信openid和位置信息到服务器
export function sendOpenIDMessage(params) {
    /*
    params['appcode'] = AppCode;
    return qwest
        .post('/manage/api/foreign/birdnest/uploadWxUserInfoAndLocationInfo',params, {timeout: 10000})
        .then(formatResponse)
        .catch(formatError);

     */
    // /manage/api/foreignapi/birdnest/uploadWxUserInfoAndLocationInfo

    // return doHttpRequest('/manage/api/foreign/birdnest/uploadWxUserInfoAndLocationInfo',params, {timeout: 10000});
    return doHttpRequest('/manage/api/foreignapi/birdnest/uploadWxUserInfoAndLocationInfo',params, {timeout: 10000});
}


//界面中的接口按钮权限获取指定客户端类型的按钮列表
export function buttonPermision(params) {

    /*
    params['appcode'] = AppCode;
    return qwest
        .post('/manage/api/clientshowbtns/getAllClientBtnShowListByMobileType',params,{timeout: 10000})
        .then(formatResponse)
        .catch(formatError);

     */

    // return doHttpRequest('/manage/api/clientshowbtns/getAllClientBtnShowListByMobileType',params,{timeout: 10000});
    return doHttpRequest('/manage/api/appclient/clientshowbtns/getAllClientBtnShowListByMobileType',params,{timeout: 10000});
}


//登录时获取手机验证码
export function authCode(params) {
    return doHttpRequest('/usermanage/api/appclient/appUsers/getVerifyCode',params,{timeout: 10000});
}


//保存用户的收藏数据
export function saveCollectionList(params) {
    /*
    params['appcode'] = AppCode;
    return qwest
        .post('/manage/api/bizbackend/wxusercollections/saveNewCollections',params, {timeout: 5000})
        .then(formatResponse)
        .catch(formatError);

     */

    // return doHttpRequest('/manage/api/bizbackend/wxusercollections/saveNewCollections',params,{timeout: 5000});
    return doHttpRequest('/manage/api/appclient/wxusercollections/saveNewCollections',params,{timeout: 5000});
}

//查询用户的收藏数据
export function searchCollectionList(params) {
    /*
    params['appcode'] = AppCode;
    return qwest
        .post('/manage/api/bizbackend/wxusercollections/getUserCollectionsByOpenAndPage',params)
        .then(formatResponse)
        .catch(formatError);

     */

    // return doHttpRequest('/manage/api/bizbackend/wxusercollections/getUserCollectionsByOpenAndPage',params);
    return doHttpRequest('/manage/api/appclient/wxusercollections/getUserCollectionsByOpenidAndPage',params);
}

//取消用户的收藏数据
export function cancleCollectionList(params) {
    /*
    params['appcode'] = AppCode;
    return qwest
        .post('/manage/api/bizbackend/wxusercollections/cancelUserCollection',params,{timeout: 5000})
        .then(formatResponse)
        .catch(formatError);

     */
    // return doHttpRequest('/manage/api/bizbackend/wxusercollections/cancelUserCollection',params,{timeout: 5000})
    return doHttpRequest('/manage/api/appclient/wxusercollections/cancelUserCollection',params,{timeout: 5000})
}

//保存用户分享的信息
export function saveUserShareInfo(params) {
    /*
    params['appcode'] = AppCode;
    return qwest
        .post('/manage/api/appclient/usershareinfo/uploadUserShareInfo',params)
        .then(formatResponse)
        .catch(formatError);

     */

    return doHttpRequest('/manage/api/appclient/usershareinfo/uploadUserShareInfo',params);
}


//获取所有的POI编码数据 key码
export function getAllPOIList(params) {
    /*
    params['appcode'] = AppCode;
    return qwest
        .post('/manage/api/appdata/fiddata/getAllPOIEncodeData',params)
        .then(formatResponse)
        .catch(formatError);

     */

    return doHttpRequest('/manage/api/appdata/fiddata/getAllPOIEncodeData',params);

}

//获取所有的POI版本号
export function getAllVersion(params) {
    /*
    params['appcode'] = AppCode;
    return qwest
        .post('/manage/api/bizbackend/wechatlabeldataversion/getBleWechatLabelDataVersion',params)
        .then(formatResponse)
        .catch(formatError);

     */

    return doHttpRequest('/manage/api/bizbackend/wechatlabeldataversion/getBleWechatLabelDataVersion',params);
}


//小程序上传热搜
export function saveNewHotSearchData(params) {
    /*
    params['appcode'] = AppCode;
    return qwest
        .post('/manage/api/staticsdata/hotsearchdata/saveNewHotSearchData',params)
        .then(formatResponse)
        .catch(formatError);

     */
    return doHttpRequest('/manage/api/staticsdata/hotsearchdata/saveNewHotSearchData',params);
}

//小程序批量上传热搜
export function saveNewHotSearchDatas(params) {
    /*
    params['appcode'] = AppCode;
    return qwest
        .post('/manage/api/staticsdata/hotsearchdata/saveNewHotSearchDatas',params)
        .then(formatResponse)
        .catch(formatError);
     */

    // return doHttpRequest('/manage/api/staticsdata/hotsearchdata/saveNewHotSearchDatas',params);
    return doHttpRequest('/manage/api/appclient/staticsdata/hotsearchdata/saveNewHotSearchDatas',params);
}


//小程序首页顶部消息通知
export function HomeNotifityMessage(params) {
    // params['appcode'] = AppCode;
    // return qwest
    //     .post('/manage/api/appclient/noticemessage/clientGetNoticeMessage',params,{timeout: 10000})
    //     .then(formatResponse)
    //     .catch(formatError);

    return doHttpRequest('/manage/api/appclient/noticemessage/clientGetNoticeMessage',params,{timeout: 10000});
}


//保存用户访问记录
export function saveUserRequest(params) {
    /*
    params['appcode'] = AppCode;
    return qwest
        .post('/manage/api/appclient/uservolumestatistics/saveUserRequest',params)
        .then(formatResponse)
        .catch(formatError);

     */

    return doHttpRequest('/manage/api/appclient/uservolumestatistics/saveUserRequest',params);
}


//测试音频解析
export function testParseVoiceId(params) {
    /*
    params['appcode'] = AppCode;
    return qwest
        .post('/manage/api/appclient/uservolumestatistics/saveUserRequest',params)
        .then(formatResponse)
        .catch(formatError);

     */

    return qwest
        .post('/manage/api/appclient/aidata/asrByWechatMediaId',params)
        .then(formatResponse)
        .catch(formatError);

}


export  function doHttpRequest(url,params,timeOut={}) {
    params['appcode'] = AppCode;


    console.log("doHttpRequest ======  ",url);
    console.log('params===',params);
    // console.error("--------------------------------")
    return qwest
        .post(url,params,timeOut)
        .then(formatResponse)
        .catch(formatError);
}

/*
function isEmptyObject(obj){
    for (const n in obj) {
        return false;
    }
    return true;
}
*/
