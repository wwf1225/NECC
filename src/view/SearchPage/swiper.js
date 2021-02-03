import "./swiper.less";
import React from 'react';
import "./common_collectList.less";
import {Locale, Lang} from "../../utils/translation";
import {getNameByGroupID} from "../../utils/util";
// import LocalCache from "../../utils/storage_cache";
// import {cancleCollectionList} from "../../api/app";
// import {initialCollectList} from "../../indoor_position/label_beacon";

class SwiperItemPage extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            hasTransition: false
        }
    }

    componentDidMount() {
        this.startX = 0;
        this.currentX = 0;
        this.moveX = 0;
        this.moveY = 0;
        this.startY = 0;
    }


    handleTouchStart = e => {
        this.startX = e.touches[0].pageX
        this.startY = e.touches[0].pageY
    }

    componentWillMount() {
        this.moveX = 0;
    }

    handleTouchMove = (index, e) => {
        console.log("触摸Move", e, index);
        this.currentX = e.touches[0].pageX
        this.moveX = this.currentX - this.startX
        this.moveY = e.touches[0].pageY - this.startY
        // 纵向移动时return
        if (Math.abs(this.moveY) > Math.abs(this.moveX)) {
            return
        }
        // 滑动超过一定距离时，才触发
        if (Math.abs(this.moveX) < 10) {
            return
        } else {
            // 否则没有动画效果
            this.setState({
                hasTransition: true
            })
        }
        this.props.onSetCurIndex(index)
    }

    handleTouchEnd = e => {
        this.setState({
            hasTransition: true
        })
    }

    checkOne = () => {
        var obj = document.getElementById('chkAll');
        var chks = document.getElementsByName("chk");
        var j = 1;
        for (var i = 0; i < chks.length; i++) {
            if(chks[i].checked == true) {
                j++
                if(j = chks.length)  obj.checked = true;
            } else {
                obj.checked = false;
            }
        }
    }


    showOtherContain = (item) => {
        if (item.collectionType === "food") {
            return (
                <div className="imageContainer" onClick={this.checkOne}>
                    {/*<img alt="" className="IconImage" src={require("../../assets/image/icon_food.jpg")}/>*/}
                    <img alt="" className="IconImage" src={require("../../assets/image/n_cell_location@2x.png")}/>
                    {/*<div className="typeName">{Lang.Food}</div>*/}
                    <input type="checkbox" name="chk" />
                </div>
            )
        } else if (item.collectionType === "zhanwei") {
            return (
                <div className="imageContainer" onClick={this.checkOne}>
                    {/*<img alt="" className="IconImage" src={require("../../assets/image/icon_zhan.jpg")}/>*/}
                    <img alt="" className="IconImage" src={require("../../assets/image/n_cell_location@2x.png")}/>
                    {/*<div className="typeName">{Lang.Booth}</div>*/}
                    <input type="checkbox" name="chk" />
                </div>
            )
        } else {
            return (
                <div className="imageContainer" onClick={this.checkOne}>
                    <img alt="" className="IconImage" src={require("../../assets/image/n_cell_location@2x.png")}/>
                    {/*<div className="typeName">{Lang.Other}</div>*/}
                    <input type="checkbox" name="chk" />
                </div>
            )
        }
    }

    goShareMessage = (item) => {
        this.props.goShare(item);
    }

    goRouterLine = (item) => {
        console.log('路线==',this.props)
        this.props.goRouter(item);
    }

    goDelectCurrent = (item, index) => {
        // console.log(item);
        this.props.getDelectMessage(item, index);
    }


    render() {
        const {index, currentIndex, item, AllButton} = this.props;
        const {hasTransition} = this.state;
        const distance = this.moveX >= 0 ? 0 : -60;
        let moveStyle = {}
        // // 排他性，若某一个处于滑动状态时，其他都回归原位
        if (hasTransition && currentIndex === index) {
            moveStyle.transform = `translateX(${distance}px)`
            moveStyle.transition = 'transform 0.3s ease'
        }
        return (
            <div className='swipe-item'>
                <div className='swipe-item-wrap'>
                    <div
                        style={moveStyle}
                        className='swipe-item-left'
                        onTouchStart={this.handleTouchStart}
                        onTouchMove={this.handleTouchMove.bind(this, index)}
                        onTouchEnd={this.handleTouchEnd}
                    >
                        <div className="singleStyle">

                            <div className="LeftStyle">
                                {this.showOtherContain(item)}
                                <div className="POINameStyle">

                                    <div className="POIName">
                                        {
                                            Locale === "en" ? (item.ename === null ? "More" : item.ename.replace("%rn%", "").replace("%rn%", "").replace("%rn%", "")) : (item.name === null ? "其他" : item.name.replace("%rn%", "").replace("%rn%", "").replace("%rn%", ""))
                                        }
                                    </div>
                                    <div className="POINameFloor">{getNameByGroupID(Number(item.groupid))}</div>
                                </div>
                            </div>
                            <div className="RightStyle">
                                {/*{
                      AllButton.length !== 0 && AllButton.indexOf("cell_route") >= 0 ? 
                        (
                        <div className="rightPosition" onClick={() => this.goRouterLine(item)}>
                          <img alt="" className="shareImage" src={require("../../assets/image/collect_right_but@2x.png")} />
                          <div className="POINameFloor">{`${Lang.Route}`}</div>
                        </div> 
                        ) : null
                    }*/}


                                <div className="imageContainer" onClick={() => this.goShareMessage(item)}>
                                    <img alt="" className="shareImage"
                                         src={require("../../assets/image/n_tbar2@2x.png")}/>
                                    <div className="typeName">{`${Lang.Share}`}</div>
                                </div>

                                <div className="rightPosition" onClick={() => this.goRouterLine(item)}>
                                    <img alt="" className="shareImage"
                                         src={require("../../assets/image/n_blue_go@2x.png")}/>
                                    {/*<div className="POINameFloor">{`${Lang.Route}`}</div>*/}
                                    <div className="POINameFloor">{`${Lang.Go}`}</div>
                                </div>

                            </div>
                        </div>
                        <div className='swipe-item-right' onClick={() => this.goDelectCurrent(item, index)}>
                            <div className='swipe-item-del'>{`${Lang.Delect}`}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default SwiperItemPage;