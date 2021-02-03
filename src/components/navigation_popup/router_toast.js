/**
 * 开始导航之后显示的popup
 */

import React from 'react';
import "./route_plan.less";


class RouteToast extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  showNaviDirection = () => {
    const {navishowDirection} = this.props;
    if(navishowDirection === "前"){
      return(
        <img alt="" className='imageShow' src={require("../../assets/image/navi/route_direction_line@2x.png")} />
      )
    }else if(navishowDirection === "上"){
      return(
        <img alt="" className='imageShow' src={require("../../assets/image/navi/route_direction_elevator@2x.png")} />
      )
    }else if(navishowDirection === "下"){
      return(
        <img alt="" className='imageShow' src={require("../../assets/image/navi/route_direction_elevator@2x.png")} />
      )
    }else if(navishowDirection === "右"){
      return(
        <img alt="" className='imageShow' src={require("../../assets/image/navi/route_direction_right@2x.png")} />
      )
    }else if(navishowDirection === "右前"){
      return(
        <img alt="" className='imageShow' src={require("../../assets/image/navi/route_direction_rightfront@2x.png")} />
      )
    }else if(navishowDirection === "右后"){
      return(
        <img alt="" className='imageShow' src={require("../../assets/image/navi/route_direction_rightfront@2x.png")} />
      )
    }else if(navishowDirection === "后"){
      return(
        <img alt="" className='imageShow' src={require("../../assets/image/navi/route_direction_turnaround@2x.png")} />
      )
    }else if(navishowDirection === "左"){
      return(
        <img alt="" className='imageShow' src={require("../../assets/image/navi/route_direction_left@2x.png")} />
      )
    }else if(navishowDirection === "左前"){
      return(
        <img alt="" className='imageShow' src={require("../../assets/image/navi/route_direction_leftfront@2x.png")} />
      )
    }else if(navishowDirection === "左后"){
      return(
        <img alt="" className='imageShow' src={require("../../assets/image/navi/route_direction_leftfront@2x.png")} />
      )
    }else if(navishowDirection === "终"){
      return(
        <img alt="" className='imageShow' src={require("../../assets/image/route/route_icon_end@2x.png")} />
      )
    }else{
      console.log("导航过程中navishowDirection的其他方向",navishowDirection);
    }
  }

  // showNaviDirection = () => {
  //   console.log("-----------图片渲染-----------");
  //   return (
  //     <img alt="" className='imageShow' src={require("../../assets/image/route/route_icon_end@2x.png")} />
  //   )
  // }


  render() {
    const {showTopText,visible} = this.props;
    if(!visible) return null;
    return(
      <div className='topBox'>
          <div className='naviDescBox'>
            {/* {showTopText} */}
            {this.showNaviDirection()}
            {/* 直行12米 右转 */}
            <div>{showTopText}</div>
          </div>
      </div>
    )
  }
}

export default RouteToast;