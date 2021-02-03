/**
 * 从小程序那边获取到openID参数
 * 存储到本地
 */
import LocalCache from "../utils/storage_cache";
import {getUrlParams} from "../utils/getUrlParams";

export function initialOpenID() {
  var openid = getUrlParams('openid');
  if(openid){
    var changeOpenID = openid.replace("/","").replace("#","");
  }
  // LocalCache.set("openID",changeOpenID);
}