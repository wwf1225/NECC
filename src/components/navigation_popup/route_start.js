/**
 * 开始导航之后显示的popup
 */

import React from 'react';
import "./route_plan.less";
import {Lang} from "../../utils/translation";


class RouteStartPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  exitButton = () => {
    this.props.exitNav();
  }

  allRoute = () => {
    this.props.allRouteList();
  }


  
  render() {
    const {naviStartPopTime,naviStartPopDistance,visible} = this.props;
    if(!visible) return null;
    return(
      <div className="exitContainer">
        {/*<div className="exit" onClick={this.exitButton}>{Lang.Exit}</div>*/}
        <div className="exitFa" onClick={this.exitButton}>
          <div><img src={require('../../assets/image/n_pop_closed@3x.png')} style={{width: '30px',height: '30px'}} /></div>
          <div className="exit" >{Lang.Exit}</div>
        </div>

        <div className="minuteTime">{Lang.Surplus} {naviStartPopDistance} {Lang.Meter} {naviStartPopTime} {Lang.Minute}</div>
        <div className="exit" onClick={this.allRoute}>{Lang.SeeAll}</div>
      </div>
    )
  }
}

export default RouteStartPopup;