import React, {Component} from 'react';
import "./history_search.less";
import {Locale, Lang} from "../../utils/translation";
import {App_ID} from "../../utils/config";
// import SearchInputView from "../SearchPage/search_input";
import {getNameByGroupID, KEncode, sortTheCacheHistoryList} from "../../utils/util";
import Storage from "../../utils/storage_cache";
import TypePoi from "../../api/TypePoi";
import {moveSlideBoardTo} from '../../components/map/touchCard'

const wx = window.wx;

class HistorySearchNew extends Component {
    constructor(props) {
        super(props);
        this.routerPermission = null;
        this.state = {
            legends: [
                [
                    {key: 'parking', name: `${Lang.FloorPosition}`, icon: 'parking'},
                    {key: 'elevator', name: `${Lang.Elevator}`, icon: 'elevator'},
                    {key: 'toilet', name: `${Lang.Toilet}`, icon: 'toilet'},
                    {key: 'subway', name: `${Lang.SubwayExit}`, icon: 'subway'},
                    {key: 'food', name: `${Lang.Food}`, icon: 'food'}
                ],
            ],
            CacheList: [],

        };

    }

    componentDidMount() {
        this.props.onRef2(this);
        var newArray = [];
        // this.routerPermission = this.props.props.location.state.list;
        this.routerPermission =  ["button_collect", "button_ar_signwal_show", "cell_route", "info_msg", "popview_go", "button_ar", "button_share", "button_mark"];

        // var historyCaches = Storage.get("_hot_history");
        //
        // newArray = sortTheCacheHistoryList(historyCaches, TypePoi);
        //
        // this.setState({
        //     CacheList: newArray
        // })

        this.searchHistory();

    }

    searchHistory() {
        var newArray = [];
        var historyCaches = Storage.get("_hot_history");

        newArray = sortTheCacheHistoryList(historyCaches, TypePoi);

        this.setState({
            CacheList: newArray
        })
    }

    clickCurrentData = (item, index) => {
        console.log(item);
        this.props.clickCurrentData(item);
        // this.props.history.push({pathname:'/', state: {item:item}});
    }

    shareCurrentData = (item, index) => {
        // console.log(item);
        // console.log("跳转至分享界面");
        //==========跳转至分享界面==========//
        var KeyEnCode = KEncode(item.mapCoord.x, item.mapCoord.y, item.groupID);
        var floorName = getNameByGroupID(item.groupID);
        var PoiCoorX = item.mapCoord.x;
        var PoiCoorY = item.mapCoord.y;
        var PoigroupID = item.groupID;
        var PoiName = item.name === null ? null : item.name.replace("%rn%", "").replace("%rn%", "").replace("%rn%", "");
        var PoiEname = item.ename === null ? null : item.ename.replace("%rn%", "").replace("%rn%", "").replace("%rn%", "");
        var PoiFid = item.FID;
        //==========跳转至分享界面==========//
        wx.miniProgram.getEnv(function (res) {
            if (res.miniprogram === true) {
                wx.miniProgram.navigateTo({
                    url: `/pages/share/index?shareKeyEnCode=${KeyEnCode}&floorName=${floorName}&PoiName=${PoiName}&PoiFid=${PoiFid}&PoiEname=${PoiEname}&PoigroupID=${PoigroupID}&PoiCoorX=${PoiCoorX}&PoiCoorY=${PoiCoorY}`,
                    appId: App_ID,
                    success: function () {
                        console.log("跳转成功");
                    },
                    error: function (err) {
                        console.log("跳转失败");
                    }
                });
            }
        });

    }


    //清除历史记录
    clearHistory = () => {
        // console.log("=====清除历史记录");
        this.setState({
            CacheList: null
        });
        Storage.set("_hot_history", null);
    }

    showOtherContain = (item) => {
        if (item.collectionType === "food") {
            return (
                <div className="imageContainer">
                    {/*<img alt="" className="IconImage" src={require("../../assets/image/icon_food.jpg")}/>
                    <div className="typeName">{Lang.Food}</div>*/}
                    <img alt="" className="IconImage" src={require("../../assets/image/n_cell_location@3x.png")}/>
                </div>
            )
        } else if (item.collectionType === "zhanwei") {
            return (
                <div className="imageContainer">
                    {/*<img alt="" className="IconImage" src={require("../../assets/image/icon_zhan.jpg")}/>
                    <div className="typeName">{Lang.Booth}</div>*/}
                    <img alt="" className="IconImage" src={require("../../assets/image/n_cell_location@3x.png")}/>
                </div>
            )
        } else {
            return (
                <div className="imageContainer">
                    {/*<img alt="" className="IconImage" src={require("../../assets/image/collect_point_but@2x.png")}/>
                    <div className="typeName">{Lang.Other}</div>*/}
                    <img alt="" className="IconImage" src={require("../../assets/image/n_cell_location@3x.png")}/>
                </div>
            )
        }
    }

    // 点击快捷搜索图标
    legendSearchGo = (value) => {
        console.log('value',value)
        // 触发父组件map中的handleKeywordSearch事件，value.name传给输入框，isShowSearchPopup: true,bottomShow: true就显示弹框
        this.props.handleKeywordSearch(value.name)

    };

    render() {
        const {legends, CacheList} = this.state;
        return (
            <React.Fragment>
                {/* 输入框返回 */}
                {/*<SearchInputView {...this.props}/>*/}
                {/* 常用的搜索条 */}
                <div className="search-legend-bd grey-sm">
                    {
                        legends.map((legend, index) => (
                            <div className="search-legend-row" key={index}>
                                {legend.map((item) => (
                                    <div
                                        className={'search-legend-item ' + (item.className ? item.className : '')}
                                        key={item.key}
                                        onClick={(e) => this.legendSearchGo(item)}>
                                        <div className={'img-icon ' + item.icon}/>
                                        <div className="text">{item.name}</div>
                                    </div>)
                                )}
                            </div>
                        ))
                    }
                </div>

                {/* 历史搜索记录 */}
                <div className="historyTitle">
                    <div className="historyText">{Lang.SearchHistory}</div>
                    <div className="rightContainer" onClick={() => this.clearHistory()}>
                        {/*<img alt="" className="ImageSize" src={require("../../assets/image/n_cell_clean@2x.png")}/>*/}
                        <span className="ImageSize"></span>
                        <div className="clearText">{Lang.ClearHistory}</div>
                    </div>
                </div>

                {CacheList && CacheList.length > 0 ?
                    (
                        <ul className="historyCont">
                            {CacheList.map((item, index) => {
                                return (
                                    <li key={index} className="singleShowStyle">
                                        <div className="LeftStyle">
                                            {this.showOtherContain(item)}
                                            {/* <div className="imageContainer">
                        <img alt="" className="IconImage" src={require("../../assets/image/collect_point_but@2x.png")} />
                        <div className="typeName">{Lang.Other}</div>
                      </div> */}
                                            <div className="POINameStyle">
                                                <div className="POIName">
                                                    {
                                                        Locale === "en" ? (item.ename === null ? "More" : item.ename.replace("%rn%", "").replace("%rn%", "").replace("%rn%", "")) : (item.name === null ? "其他" : item.name.replace("%rn%", "").replace("%rn%", "").replace("%rn%", ""))
                                                    }
                                                    {/* {item.name === null ? "其他" : item.name} */}
                                                </div>
                                                <div className="POINameFloor">{getNameByGroupID(item.groupID)}</div>
                                            </div>
                                        </div>
                                        <div className="RightStyle">

                                            {
                                                this.routerPermission.length !== 0 && this.routerPermission.indexOf("cell_route") >= 0 ?
                                                    (
                                                        <div className="rightPosition" onClick={() => this.clickCurrentData(item, index)}>
                                                            <img alt="" className="shareImage"
                                                                 src={require("../../assets/image/n_route@2x.png")}/>
                                                            <div className="POINameFloor">{Lang.Route}</div>
                                                        </div>
                                                    ) : null
                                            }
                                            {/*<div className="imageContainer"
                                                 onClick={() => this.shareCurrentData(item, index)}>
                                                <img alt="" className="shareImage"
                                                     src={require("../../assets/image/share.png")}/>
                                                <div className="typeName">{Lang.Share}</div>
                                            </div>*/}


                                        </div>
                                         {/*<div className="lineHiehgt"></div>*/}
                                    </li>
                                )
                            })}
                        </ul>
                    ) :
                    (<div className="noSearchHistory">
                            <div><img className="noSearchHistoryImg" src={require('../../assets/image/n_collect_empty@2x.png')} alt=""/></div>
                            <div className="noSearch">{Lang.NoSearchHistory}</div>
                    </div>

                    )
                }

            </React.Fragment>
        );
    }
}

export default HistorySearchNew;