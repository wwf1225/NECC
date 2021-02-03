import React from 'react';
import ReactDOM from 'react-dom';
import 'weui';
import 'react-weui/build/packages/react-weui.css';
import 'normalize.css';
// import RouteInfo from "./view/Router/route_info";

import RouteMessage from "./view/Router/route";
// import Login from "./view/Login/login"
// import App from "./App"
import * as serviceWorker from './serviceWorker';
import {AppVersion} from "./utils/config";
import {getURLParams} from "./utils/util";


const UrlParams = getURLParams();

// if (UrlParams.debug !== undefined) {
//     new window.VConsole();
// }

// new window.VConsole();


console.log('当前版本', AppVersion);

ReactDOM.render(<RouteMessage />, document.getElementById('root'));

// ReactDOM.render(<Login />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
