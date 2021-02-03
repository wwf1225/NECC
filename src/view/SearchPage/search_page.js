/**
 * 搜索界面
 */
import "./pull_to.less";
import React from 'react';
import SwiperList from "./SwiperList";
import SearchInputView from "./search_input";
import style from "./search_input.module.less";
import LocalCache from "../../utils/storage_cache";
import {cancleCollectionList} from "../../api/app";
import EmptyComponent from "../../components/empty";
import {Lang} from "../../utils/translation";
import TypePoi from "../../api/TypePoi.json";
import {notify} from '../../components/notify_toast/notify';
import {getNameByGroupID, KEncode, useParamIsInArrays, sortTheCacheList} from "../../utils/util";
import {initialCollectList} from "../../indoor_position/label_beacon";
import {Dialog, Tab, TabBody, NavBar, NavBarItem} from 'react-weui/build/packages';
import {App_ID} from "../../utils/config";
import {moveSlideBoardTo} from "../../components/map/touchCard";
// import {CellHeader, Checkbox, Form, FormCell} from "react-weui";
import {AppCode, AppType, MapId} from "../../utils/config";
import qwest from "qwest";

const wx = window.wx;
var newCollectList = [];

class SearchPage extends React.Component {

    constructor(props) {
        super(props);
        this.AllButtonPermission = [];
        this.state = {
            tab: 0,
            hasMore: true,
            page: 1,
            noMore: true,
            allList: [],
            zhanList: [],
            foodList: [],
            otherList: [],
            cacheCollectMessage: LocalCache.get('_collect_'),
            other: null,
            changeStatus: null,
            showAndroid2: false,
            style2: {
                // title: 'Heading',
                buttons: [
                    {
                        type: 'default',
                        label: '取消',
                        onClick: this.hideDialog.bind(this)
                    },
                    {
                        type: 'primary',
                        label: '确定',
                        onClick: this.confirmDialog.bind(this)
                    }
                ]
            }
        }

        // initialCollectList(); // 初始化渲染收藏列表

        // var timer = setInterval(() => {
        //      initialCollectList(); // 初始化渲染收藏列表
        //  },1000);


    }

    hideDialog() {
        this.setState({
            showIOS2: false,
        });
    }

    // 批量删除取消收藏确定按钮
    confirmDialog() {
        let that = this;
        var chks = document.getElementsByName("chk");
        var obj = document.getElementById('chkAll');
        console.log(55555555555, chks)

        if (obj.checked === true) {
            LocalCache.remove("_collect_");
            that.props.history.push({pathname: '/'});
        }

        var paramsLists = [];
        for (var i = 0; i < chks.length; i++) {
            if (chks[i].checked === true) {
                console.log(1616, newCollectList[i]);
                var collectCash = LocalCache.get("_collect_");
                var data = newCollectList[i];
                for (let key in collectCash) {
                    delete collectCash[`${data.typeid}_${data.fid}`]
                }
                LocalCache.set("_collect_", collectCash);
                that.props.history.push({pathname: '/'});

                var paramsList = {
                    unid: LocalCache.get("userInfo").userUuid,
                    fid: data.fid,
                    "venueuuid": MapId,
                    "appcode": AppCode,
                    "apptype": AppType
                }
                paramsLists.push(paramsList);
            }

            this.setState({
                showIOS2: false,
            });
        }

        console.log(666666666666, paramsLists);
        qwest.post("/manage/api/appclient/wxusercollections/cancelUserCollectionBatch", paramsLists)
            .then(function (xhr, res) {
                console.log('批量取消用户收藏===', res);
                if (res.code == 0) {
                    that.props.history.push({pathname: '/'});
                }

            })
            .catch(function (e, xhr, res) {
                console.error(e);
                console.error(res);
            })
            .complete(function () {
                // console.error("  ======  complete ======= ");
            });


    }

    handleStep = () => {
        this.props.history.go(-1);
    }

    handleRouter = () => {
        this.props.history.go(-1);
    }


    componentDidMount() {


        //============缓存获取收藏列表数据============//

        this.AllButtonPermission = this.props.location.state.allButton || [];
        // let newCollectList = [];

        let cacheList = LocalCache.get('_collect_');

        var zhanArray = [];
        var foodArray = [];
        var othersArray = [];

        zhanArray = useParamIsInArrays(cacheList, TypePoi['zhanwei'], 'zhanwei');
        foodArray = useParamIsInArrays(cacheList, TypePoi['food'], 'food');
        othersArray = useParamIsInArrays(cacheList, TypePoi, 'others');

        newCollectList = sortTheCacheList(cacheList, TypePoi);

        this.setState({
            otherList: othersArray,
            zhanList: zhanArray,
            allList: newCollectList,
            foodList: foodArray
        })


        //============缓存获取收藏列表数据============//
    }


    goShareMessage = (item) => {
        // console.log("分享",item);
        //=====跳转分享界面传递的参数=====//
        var KeyEnCode = KEncode(item.centerX, item.centerY, item.groupid);
        var floorName = getNameByGroupID(Number(item.groupid));
        var PoiCoorX = item.centerX;
        var PoiCoorY = item.centerY;
        var PoigroupID = Number(item.groupid);
        var PoiName = item.name === null ? null : item.name.replace("%rn%", "").replace("%rn%", "").replace("%rn%", "");
        var PoiEname = item.ename === null ? null : item.ename.replace("%rn%", "").replace("%rn%", "").replace("%rn%", "");
        var PoiFid = item.fid;
        //=====跳转分享界面传递的参数=====//
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


    componentWillReceiveProps(nextProps) {
        console.log("====接收到到props参数====", nextProps);
    }


    //删除当前的item  更新缓存列表中的数据  再次重新渲染当前组件
    okDelectInfo = (item, index) => {
        var that = this;
        // var paramsObj = {
        //     unid: LocalCache.get("openID"),
        //     fid: item.fid
        // }
        var paramsObj = {
            unid: LocalCache.get("openID"),
            // unid: 'oM5F45EZ68gYofu1UeMfWmGdmDCE',
            fid: item.fid,
            "venueuuid": MapId,
            "appcode": AppCode,
            "apptype": AppType
        }
        console.log('左滑删除：', item);

        var allArray = that.state.allList.filter(function (e) {
            return e.fid !== item.fid
        });

        var zhanArray = that.state.zhanList.filter(function (e) {
            return e.fid !== item.fid
        });

        var foodArray = that.state.foodList.filter(function (e) {
            return e.fid !== item.fid
        });

        var otherArray = that.state.otherList.filter(function (e) {
            return e.fid !== item.fid
        });

        this.setState({
            allList: allArray,
            zhanList: zhanArray,
            otherList: otherArray,
            foodList: foodArray
        })

        // cancleCollectionList(paramsObj).then((res) => {
        //     console.log(res);
        //     if (res.code === 0) {
        //         LocalCache.get("_collect_")[`${item.typeid}_${item.fid}`] = null;
        //         initialCollectList();
        //     } else {
        //         notify.show(`${Lang.TimeOut}`, 'warning');
        //     }
        // })


        qwest.post("/manage/api/appclient/wxusercollections/cancelUserCollection", paramsObj)
            .then(function (xhr, res) {
                console.log('取消用户收藏===', res, xhr);
                if (res.code == 0) {
                    LocalCache.get("_collect_")[`${item.typeid}_${item.fid}`] = null;
                    initialCollectList();
                } else {
                    notify.show(`${Lang.TimeOut}`, 'warning');
                }
            })
            .catch(function (e, xhr, res) {
                console.error(e);
                console.error(res);
            })
            .complete(function () {
                // console.error("  ======  complete ======= ");
            });


    }

    goRouterLine = (item) => {
        console.log("路线", item);
        // let timer = setInterval(() => {
        //     moveSlideBoardTo(0);
        // }, 10)
        // setTimeout(() => {
        //     clearInterval(timer)
        // }, 1000);
        this.props.history.push({pathname: '/', state: {sharePositionMessage: item}});
    }

    handLoadMore = () => {
        console.log("加载更多");
    }
    // 点击选中全部
    chkAll_onclick = () => {
        var obj = document.getElementById('chkAll');
        var chks = document.getElementsByName("chk");
        for (var i = 0; i < chks.length; i++) {
            chks[i].checked = obj.checked;
        }
    }

    deleteCollect = () => {
        var chks = document.getElementsByName("chk");
        for (var i = 0; i < chks.length; i++) {
            if (chks[i].checked == true) {
                return this.setState({
                    showIOS2: true
                })
            }
        }


    }

    showContainer = () => {
        if (this.state.tab === 0) {
            return (
                <div className={style.allInfo}>
                    {
                        this.state.allList && this.state.allList.length > 0 ?
                            <SwiperList
                                AllButtonPermission={this.AllButtonPermission}
                                getInfoMessage={this.okDelectInfo}
                                goShareData={this.goShareMessage}
                                goRouterData={this.goRouterLine}
                                onClick={this.handleRouter}
                                visiable={this.state.noMore}
                                dataList={this.state.allList}
                            /> :
                            <EmptyComponent onClick={this.handleStep}/>
                    }
                </div>
            )
        } else if (this.state.tab === 1) {
            return (
                <div className={style.allInfo}>
                    {
                        this.state.zhanList && this.state.zhanList.length > 0 ?
                            <SwiperList
                                AllButtonPermission={this.AllButtonPermission}
                                getInfoMessage={this.okDelectInfo}
                                goShareData={this.goShareMessage}
                                goRouterData={this.goRouterLine}
                                onClick={this.handleRouter}
                                visiable={this.state.noMore}
                                dataList={this.state.zhanList}
                            /> :
                            <EmptyComponent onClick={this.handleStep}/>
                    }
                </div>
            )
        } else if (this.state.tab === 2) {
            return (
                <div className={style.allInfo}>
                    {
                        this.state.foodList && this.state.foodList.length > 0 ?
                            <SwiperList
                                AllButtonPermission={this.AllButtonPermission}
                                getInfoMessage={this.okDelectInfo}
                                goShareData={this.goShareMessage}
                                goRouterData={this.goRouterLine}
                                onClick={this.handleRouter}
                                visiable={this.state.noMore}
                                dataList={this.state.foodList}
                            /> :
                            <EmptyComponent onClick={this.handleStep}/>
                    }
                </div>
            )
        } else {
            return (
                <div className={style.allInfo}>
                    {
                        this.state.otherList && this.state.otherList.length > 0 ?
                            <SwiperList
                                AllButtonPermission={this.AllButtonPermission}
                                getInfoMessage={this.okDelectInfo}
                                goShareData={this.goShareMessage}
                                goRouterData={this.goRouterLine}
                                onClick={this.handleRouter}
                                visiable={this.state.noMore}
                                dataList={this.state.otherList}
                            /> :
                            <EmptyComponent onClick={this.handleStep}/>
                    }
                </div>
            )
        }
    }

    render() {
        return (
            <React.Fragment>
                <div>
                    {/* 返回 */}
                    <SearchInputView {...this.props}/>
                    {/* table切换标签 */}
                    <div>
                        <Tab>
                            <NavBar>
                                <NavBarItem className={style.weui_navbar} active={this.state.tab === 0}
                                            onClick={e => this.setState({tab: 0})}>{Lang.All}</NavBarItem>
                                <NavBarItem className={style.weui_navbar} active={this.state.tab === 1}
                                            onClick={e => this.setState({tab: 1})}>{Lang.Booth}</NavBarItem>
                                <NavBarItem className={style.weui_navbar} active={this.state.tab === 2}
                                            onClick={e => this.setState({tab: 2})}>{Lang.Food}</NavBarItem>
                                <NavBarItem className={style.weui_navbar} active={this.state.tab === 3}
                                            onClick={e => this.setState({tab: 3})}>{Lang.Other}</NavBarItem>
                            </NavBar>

                            <TabBody className={style.searchCont}>
                                {this.showContainer()}
                            </TabBody>
                            <div className={style.bottomBtnFa}>
                                <div className={style.bottomBtn}>
                                    <div className={style.bottomAll}>
                                        <input type="checkbox" id="chkAll" name="chkAll" onClick={this.chkAll_onclick}/>
                                        <div className={style.checkedAll}>&nbsp;&nbsp;全选</div>
                                    </div>
                                    <div>
                                        {/*<button className={style.del} onClick={e => this.setState({showIOS2: true})}>删除</button>*/}
                                        <button className={style.del} onClick={this.deleteCollect}>删除</button>
                                    </div>
                                </div>
                            </div>

                            <Dialog className={style.dialog} type="ios" buttons={this.state.style2.buttons}
                                    show={this.state.showIOS2}>
                                是否删除选中的收藏?
                            </Dialog>

                        </Tab>
                    </div>
                </div>
            </React.Fragment>
        )
    }

}

export default SearchPage;
