
/**
 * 公用的收藏列表
 * 只需接收传来的dataList数据
 * visable用来显示当到达最后一页的时候显示的内容 避免和上拉加载的数据出现冲突
 */
import React from 'react';
import {getNameByGroupID} from "../../utils/util";
import "./common_collectList.less";

class CommonCollectList extends React.Component{ 
  constructor() {
    super();
    this.state = {
    }
  }

  
  noMoreData = () => {
    const {onClick} = this.props;
    return (
      <div className="noMoreStyle">
        <img alt="" className="emptyIcon" src={require("../../assets/image/icon_empty.png")} />
        <div className="textStyle">没有更多收藏啦～</div>
        <button onClick={onClick}>逛一逛</button>
      </div>
    )
  }

  showOtherContain = (item) => {
    if(item.typeid === 210102) {
      return (
        <div className="imageContainer">
          <img alt="" className="IconImage" src={require("../../assets/image/icon_food.jpg")} />
          <div className="typeName">餐饮</div>
        </div>
      )
    }else if(item.typeid === 210101){
      return (
        <div className="imageContainer">
          <img alt="" className="IconImage" src={require("../../assets/image/icon_zhan.jpg")} />
          <div className="typeName">展位</div>
        </div>
      )
    }else{
      return (
        <div className="imageContainer">
          <img alt="" className="IconImage" src={require("../../assets/image/collect_point_but@2x.png")} />
          <div className="typeName">其他</div>
        </div>
      )
    }
  }

  goShareMessage = (item) => {
    this.props.goShareMessage(item);
  }

  goRouterLine = (item) => {
    this.props.goRouterLine(item);
  }

  render() {

    const {dataList,visiable} = this.props;
 
    return (
      <div>
        <ul>
          {dataList.map( (item, index )=>{
            return (
              <div key={index}>
                <li className="singleStyle">
                  <div className="LeftStyle">
                    {this.showOtherContain(item)}
                    <div className="POINameStyle">
                      <div className="POIName">{item.name === null ? "其他" : item.name}</div>
                      <div className="POINameFloor">{getNameByGroupID(Number(item.groupid))}</div>
                    </div>
                  </div>
                  <div className="RightStyle">
                    <div className="imageContainer" onClick={() => this.goShareMessage(item)}>
                      {/*<img alt="" className="shareImage" src={require("../../assets/image/share.png")} />*/}
                      <img alt="" className="shareImage" src={require("../../assets/image/n_cell_share@3x.png")} />
                      <div className="typeName">分享</div>
                    </div>
                    <div className="rightPosition" onClick={() => this.goRouterLine(item)}>
                      <img alt="" className="shareImage" src={require("../../assets/image/collect_right_but@2x.png")} />
                      <div className="POINameFloor">路线</div>
                    </div>
                  </div>
                </li>
              </div>
            )
          })}
        </ul>
        { visiable ? this.noMoreData() : null}
      </div>
    )
  }
}


export default CommonCollectList;