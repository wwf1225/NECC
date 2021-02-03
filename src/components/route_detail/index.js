
/**
 * 路线详情组件
 */

import React from 'react';
import "./index.less";
import {Lang} from "../../utils/translation";

class RouterDetail extends React.Component {

  showMap = () => {
    this.props.showMapPop();
  }
  startRouteNavList = () => {
    this.props.startRouteNav();
  }

  render() {
    const {naviList,naviSwitch,naviDistance,naviTime,visible} = this.props;
    // console.log(naviSwitch);
    if(!visible) return null;
    return(
      <React.Fragment>
        <div className="routeContainer animated faster slideInUp routeCont">
          <div className="topDistanceMap">
            <div className="topTime">{naviTime} {Lang.Minute}  {naviDistance} {Lang.Meter}</div>
            <div className="topRoute">{Lang.Way} {naviList.length} {Lang.Intersection}</div>
          </div>
          <div className="itemContain">
            {
              naviList.length > 0 ?
              (
                naviList.map((item) => {
                  return (
                    <div className="list-item" key={item.key}>
                      <div className={'list-item_icon ' + (item.icon ? item.icon : '')}/>
                      <div className="list-item_text" dangerouslySetInnerHTML={{__html: item.html}}>
                      </div>
                    </div>
                  )
                })
              ) : null
            }
          </div>
          
        </div>
        <div className="bottomFiexd">
          <div className="showListRoute" onClick={this.showMap}>
            <img alt="" className="ImageSize" src={require("../../assets/image/btn_map@2x.png")} />
            <span className="fontColor">{Lang.ShowMap}</span>
          </div>
          {naviSwitch ? null :  (
            <div className="showListHere" onClick={this.startRouteNavList}>
              {/*<img alt="" className="ImageSize" src={require("../../assets/image/icon_goHere.png")} />*/}
              <img alt="" className="ImageSize" src={require("../../assets/image/n_blue_go@2x.png")} />
              <span className="fontColorHere">{Lang.StartNavigation}</span>
            </div>)}
          
        </div>
      </React.Fragment>
    )
  }
}

export default RouterDetail;