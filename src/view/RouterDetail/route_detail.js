
/**
 * 路线详情popup框
 */

import React from 'react';
import "./route_detail.less"
import SearchInputView from "../SearchPage/search_input";



class RouteDetailPage extends React.Component {
  constructor() {
    super();
    this.state = {
      DetailList: [] //路线详情
    }
  }

  componentDidMount() {
  
    console.log(this.state.DetailList);

  }

  showMap = () => {
    this.props.history.go(-1);
  }

  render() {
    this.state.DetailList = this.props.location.router.detail; //eslint-disable-line
    return (
      <React.Fragment>
        {/* 返回 */}
        <SearchInputView {...this.props}/>
        <div className="topDistance">
          <div className="topTime">22分钟  1033米</div>
          <div className="topRoute">途径5个路口</div>
        </div>
        <div className="itemContain">
          {
            this.state.DetailList.length > 0 ?
            (
              this.state.DetailList.map((item) => {
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
        <div className="bottomFiexd" >
          <div className="showListRoute" onClick={this.showMap}>
            <img alt="" className="ImageSize" src={require("../../assets/image/btn_map@2x.png")} />
            <span className="fontColor">显示地图</span>
          </div>
          <div className="showListHere">
              <img alt="" className="ImageSize" src={require("../../assets/image/icon_goHere.png")} />
              <span className="fontColorHere">开始导航</span>
          </div>
        </div>
      </React.Fragment>
    )
  }
}


export default RouteDetailPage;