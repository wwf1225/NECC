import React from 'react';
import './assets/css/app.less'; //样式初始化
import MapView from "./components/map/map_necc";
import {initialOpenID} from "./indoor_position/getMessage";
import Notification from './components/notify_toast/notify';
import {initialWechatSDK} from "./indoor_position/wechat_sdk";
import {setOriginBeanconData} from "./indoor_position/wechat_sdk";
import {updateLabelPOI} from "./indoor_position/cache_poi";
import {initialLabelBeacon, initialCollectList} from "./indoor_position/label_beacon";
import {FcDvdLogo} from "react-icons/all";
import LocalCache from "./utils/storage_cache";
import {baseWebsocketUrl} from "./utils/config";

import {FastClick} from './utils/fastclick'

// 东浩广印展 📱📱
class App extends React.Component {
    constructor() {
        super();
        this.state = {
            received_beacon_data: [],
        }

    }

    getUnid = () => {
        var url = window.location.search; //获取url中"?“符后的字串
        console.log('window.location', window.location)
        console.log("加载参数", window.location.search);
        if (url.indexOf("?") != -1) {
            // var str = url.substr(1);
            // var strs = str.split("&");
            // window.unid = decodeURIComponent(strs[0].replace("openid=", ""));//获取url中的unid
            var str = url.split('?')[1]
            window.unid = decodeURIComponent(str.replace("openid=", "")); // 获取url中的openid
            window.unid = window.unid.trim();
            console.log("unid1111111:", window.unid);
            LocalCache.set("openID", window.unid);
        }
        console.log("end unid:", "|" + window.unid + "|");
    }
    WebSocketTest = () => {
        let self = this;
        if ("WebSocket" in window) {
            console.log("您的浏览器支持 WebSocket!");
            // alert("您的浏览器支持 WebSocket!");
            var ws = new WebSocket(baseWebsocketUrl + "/manage/websocket/WSTransfer");
            ws.onopen = function () {
                // Web Socket 已连接上，使用 send() 方法发送数据
                ws.send(JSON.stringify({
                    "operationType": "GET_DATA_UNID",
                    "operationParams": {
                        "unid": window.unid
                    },
                    "extraData": ""
                }));
                // alert("数据发送中...");
            };

            ws.onmessage = function (evt) {
                // console.log('=蓝牙标签数据=evt', evt);
                var received_msg = JSON.parse(evt.data).data;
                // console.log('传过来的蓝牙标签数据JSON.parse(evt.data).data===', received_msg);
                // bleListener(null, res.beacons || [])
                // bleListener(null, received_msg || [])
                self.setState({
                    received_beacon_data: received_msg
                });
                setOriginBeanconData(self.state.received_beacon_data);
            };
            ws.onclose = function () {
                // 关闭 websocket
                console.log("websocket连接已关闭...");
                self.WebSocketTest();

            };
        } else {
            // 浏览器不支持 WebSocket
            alert("您的浏览器不支持 WebSocket!");
        }
    }

    componentWillMount() {
        console.log("APP Start !!!");
        initialWechatSDK();
        initialLabelBeacon();
        initialOpenID();
        // initialCollectList(); // 登录之后才能获取收藏
        updateLabelPOI();
    }

    componentDidMount() {
        this.getUnid();
        this.WebSocketTest();

        //参考文档 https://www.cnblogs.com/thinkingthigh/p/13578013.html    https://www.bootcdn.cn/fastclick/　
        // 解决 input、textarea 获取焦点不灵敏的问题
        // 原因：fastclick.js 引起的冲突，ios11 后修复了移动点击300ms延迟
        const u = navigator.userAgent;
        const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        // if (ver && parseInt(ver[1]) > 10) {//IOS系统
        if (isiOS) {//IOS系统
            // 引入fastclick 做相关处理
            FastClick.prototype.focus = function (targetElement) { //解决FastClick在ios输入框聚焦慢
                let length;
                if (targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
                    length = targetElement.value.length;
                    targetElement.focus();
                    targetElement.setSelectionRange(length, length);
                } else {
                    targetElement.focus();
                }
            }
            FastClick.attach(document.body)

        }


    }

    render() {
        return (
            <React.Fragment>
                <MapView {...this.props}/>
                <Notification options={{timeout: 2000}}/>
            </React.Fragment>
        );
    }

}

export default App;
