

import React from 'react';
import SwiperItem from "./swiper";
import {Lang} from "../../utils/translation";

class SwiperList extends React.Component{ 

  constructor() {
    super();
    this.state = {
      currentIndex: ""
    }
  }

  handleCurIndex = index => {
    this.setState({
      currentIndex: index
    })
  }


  noMoreData = () => {
    const {onClick} = this.props;
    return (
      <div className="noMoreStyle">
        {/*<img alt="" className="emptyIcon" src={require("../../assets/image/icon_empty.png")} />
        <div className="textStyle">{Lang.NoMoreCollections}</div>
        <button onClick={onClick}>{Lang.GoShopping}</button>*/}
      </div>
    )
  }

  goRouter = (item) => {
    this.props.goRouterData(item);
  }

  goShare = (item) => {
    this.props.goShareData(item);
  }

  // willgetMessage = (item) => {
  //   this.props.getDelectInfoMessage(item);
  // }
  getDelectInfoMessage = (item,index) => {
    this.props.getInfoMessage(item,index);
  }


  render() {
    const {dataList,visiable,AllButtonPermission} = this.props;
    return(
      <div>
        {
          dataList.length &&  dataList.map((item, index) => (
          <SwiperItem
            AllButton={AllButtonPermission}
            getDelectMessage={this.getDelectInfoMessage}
            goRouter={this.goRouter}
            goShare={this.goShare}
            item={item}
            key={index}
            index={index}
            currentIndex={this.state.currentIndex}
            onSetCurIndex={this.handleCurIndex}
          />
        ))
      }
      { visiable ? this.noMoreData() : null}
      </div>
    )
  }
}

export default SwiperList;