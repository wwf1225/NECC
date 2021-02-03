/**
 * 封装通过小程序链接  传递过来的参数
 */

export function getUrlParams(objName) {

  var data = window.location.href;

  if(data.indexOf("?") < 0 ) return undefined; //判断是否存在参数

  var allParamsArr = data.split("?")[1].split("&"), returnObj = {};

  if(allParamsArr.length === 0) return undefined; //参数是否带惨

  for(var i = 0; i < allParamsArr.length; i++) {

    returnObj[`${allParamsArr[i].split("=")[0]}`] = allParamsArr[i].split("=")[1]
    
  }

  return returnObj[`${objName}`]
}