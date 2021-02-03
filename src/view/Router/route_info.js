/**
 * 界面的路由配置单
 */

import React from 'react';
import {Route} from 'react-router-dom';
import App from "../../App"; //根路由
import SearchPage from "../SearchPage/search_page";
import Qrcode from "../Qrcode";
import NotifyDetail from "../NotifyDetail";
import HistorySearchPage from "../HistorySearch/history_search";
import CouponView from '../Coupon/coupon_view'
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import Login from  '../Login/login'
import MarqueeList from  '../Marquee/MarqueeList'
import MarqueeDetail from  '../Marquee/MarqueeDetail'
import Register from  '../Register/Register'
import ForgetPassword from '../ForgetPassword/ForgetPassword'
import Mine from '../Mine/mine'
import PersonalData from '../Mine/personalData'
import uploadAvatar from '../Mine/uploadAvatar'
import PositionShare from '../PositionShare/PositionShare'
import CurrentRoom from '../PositionShare/CurrentRoom'




class RouteInfo extends React.Component {

  render() {
    return(
      <React.Fragment>
        <CacheSwitch>
            <CacheRoute exact path="/" component={App}/>
            <Route exact path="/search" component={SearchPage}/>
            <Route exact path="/qrcode" component={Qrcode}/>
            <Route exact path="/login" component={Login}/>
            <Route exact path="/forgetpassword" component={ForgetPassword}/>
            <Route exact path="/mine" component={Mine}/>
            <Route exact path="/register" component={Register}/>
            <Route exact path="/marqueelist" component={MarqueeList}/>
            <Route exact path="/marqueedetail" component={MarqueeDetail}/>
            <Route exact path="/personaldata" component={PersonalData}/>
            <Route exact path="/positionshare" component={PositionShare}/>
            <Route exact path="/currentroom" component={CurrentRoom}/>
            <Route exact path="/uploadavatar" component={uploadAvatar}/>
            <Route exact path="/notify" component={NotifyDetail}/>
            <Route exact path="/history_search" component={HistorySearchPage}/>
            <Route exact path="/coupon" component={CouponView}/>
        </CacheSwitch>
      </React.Fragment>
    )
  }

}

export default RouteInfo;
