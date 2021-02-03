import {isEmpty, isFunction, isNumber} from "../utils/util";

// 检查response status
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
      return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

// 转换json
function parseJSON(response) {
  return response.json();
}


// 封装原有的fetch方法，以支持请求超时处理
function reqWithTimeout(url, options) {
  return new Promise(function (resolve, reject) {
      let timeoutId = null;

      if (isNumber(options.timeout)) {
          timeoutId = setTimeout(function () {
              reject(new Error("fetch timeout"))
          }, options.timeout);
      }

      fetch(url, options).then(
          (res) => {
              if (timeoutId) clearTimeout(timeoutId);
              resolve(res);
          },
          (err) => {
              if (timeoutId) clearTimeout(timeoutId);
              reject(err);
          }
      )
  });
}

/**
 * options fetch请求的配置
 * Default options are marked with *
 * {
    body: JSON.stringify(data), // must match 'Content-Type' header
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, same-origin, *omit
    headers: {
      'user-agent': 'Mozilla/4.0 MDN Example',
      'content-type': 'application/json'
    },
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // *client, no-referrer
  }
 * */
export function request(url, options) {
  options = options || {};

  return reqWithTimeout(url, options)
      .then(checkStatus)
      .then(parseJSON)
      .then((data) => {
          return isFunction(options.formatResponse)
              ? options.formatResponse(data)
              : data;
      })
      .catch((err) => {
          return {
              __state: false,
              __code: '0',
              err: err.name,
              msg: err.message
          };
      });
}


// 格式化相应数据的格式
export function formatResponse(res) {
  let result = {__state: false};

  if (isObject(res)) {
      result.__state = (res.status === '000');
      result.__code = isEmpty(res.status) ? '' : res.status;
      delete res.status;
      Object.assign(result, res);
  }

  return result;
}

export const DefaultOptions = {
  headers: {
      'content-type': 'application/json',
  },
  method: 'POST',
  // omit 忽略cookie；includes 携带cookie
  credentials: 'omit',
  body: null,
  formatResponse,
  timeout: 5000
};
