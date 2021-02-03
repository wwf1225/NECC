/**
 * 国展地图
 */
import $ from 'jquery'
import React from 'react';
import moment from 'moment';
import MapError from '../mapError';
import style from './map.module.less';
import SearchPopup from '../searchPopup';
import Marquee from "../../view/Marquee";
import SearchInput from "../searchInput";
import SwitchFloor from '../switchFloor';
import {notify} from '../notify_toast/notify';
import RouterDetailPage from "../route_detail";
import {sendOpenIDMessage, testParseVoiceId} from "../../api/app";
import LocalCache from "../../utils/storage_cache";
import {Locale, Lang} from "../../utils/translation";
import {getUrlParams} from "../../utils/getUrlParams";
import pnpoly from "../../indoor_position/near_necc";
import RouteToast from "../navigation_popup/router_toast";
import LocateButton from '../locate_button/locate_button';
import createFMMap from '../../indoor_position/create_map';
import {getRouteDetailLine} from "../../utils/route_detail";
import RoutePlanPopup from '../navigation_popup/route_plan';
import RouteStartPopup from "../navigation_popup/route_start";
import Toast from 'react-weui/build/packages/components/toast';
import HomeModalPopup from "../../view/ModalPopup/modal_popup";
import {getAllPoiListCache} from "../../indoor_position/cache_poi";
import {initialCollectList} from "../../indoor_position/label_beacon";
import {
    MapId,
    MapOptions,
    PublicUrl,
    NaviOptions,
    App_ID,
    AppCode,
    AppType,
    baseWebsocketUrl
} from "../../utils/config";


import {getNameByGroupID, KEncode, precise, KDecoder} from "../../utils/util";
import {SearchHistory, HotSearchHistoryBatchUpload} from "../../indoor_position/search_history";
import {ErrorTypes as WechatErrors, getGeoLocation, initialWechatBLE} from "../../indoor_position/wechat_sdk";
import {
    buttonPermision,
    saveCollectionList,
    cancleCollectionList,
    saveUserShareInfo,
    saveUserRequest
} from "../../api/app";
import {
    setNaviListener,
    locateByBLE,
    cancelBLELocation,
    startNavigation, stopNavigation,
    enterLocationAlgo
} from "../../indoor_position/navigation";

import {doHttpRequest} from "../../api/app"
import qwest from 'qwest';

import HistorySearchNew from '../../view/HistorySearch/history_search_new';
import {exitRoom, initLocationShareWS, queryLastCanUseRoomInfo, queryRoomInfo} from "../../utils/LocationShareWSUtil";
import inobounce from 'inobounce'
// import {Dialog} from 'react-weui';
import {Dialog} from 'react-weui';
import 'weui';
import 'react-weui/build/packages/react-weui.css';

let GifPlayer = require('react-gif-player');

const fengmap = window.fengmap;
const wx = window.wx;
let gpstimer = null;

var layer = new fengmap.FMTextMarkerLayer();   //实例化TextMarkerLayer
var timerInter;


// var countClick = 0; //按钮点击次数 显示隐藏面板
var initRate = 0.75; // 滑动面板初始显示比例
var mobileOldY = 0; //手机端记录初始点击y轴的值
var moblieTop = 0; //记录初始点击时滑板的top值
var mobileOldTIME = new Date().getTime();//记录初始点的时间

var loopCount = 0;
var loopID;

var moveFlag = true;
var curSlideBoardHeight = $(window).height() * 0.25;

class Map extends React.Component {

    constructor(props) {
        super(props);
        this.map = null;//fengmap实例
        this._currentCootd = null;
        this.LogInt = null; //初始坐标点信息
        this._locationTimer = null;// 定位按钮定时器
        this.groupControl = null; //楼层切换控件
        this._currentFloorId = 2;//定位点楼层编号,默认最下面一层
        this._viewCurrentFloorId = 2; //定位点楼层编号,默认最下面一层
        this.mapIsOk = false;  //地图是否加载完成
        this._navi = null; //导航对象
        this.eventID = null;  //事件ID
        this.poiAllInfo = null; //获取到当前到POI数据
        this.startNaviScaleLevel = null; //导航前地图缩放比例
        this.naviAnalyser = null //地图路径规划分析对象
        this.naviSwitch = false; //导航状态
        this._locationMarker = null;//自定义定位标注对象
        this.queueNotify = notify.createShowQueue(); // 排队toast提示方法
        this.imgMarkerLayer = null; //image marker layer
        this.endPointMarker = null; //设置终点的point
        this.openID = LocalCache.get("openID");
        this.isFloorChange = false;
        this.mapCoordXInfo = null;
        this.mapCoordYInfo = null;
        this.floorIDInfo = null;
        this.selectedModel = null; //当前点击选中模型
        this.showMapLanguage = null;
        this.state = {
            locationStatus: 1,  // 地图左下角的按钮状态
            isMapError: false, // 地图加载出错
            isShowLoading: false,
            showLocateBtn: false,
            showMapInput: false,
            destination: null,
            showRoutePopup: false,
            permisionList: [],
            groupIDs: [4, 3, 2, 1], //楼层数量,
            isCollectMessage: false,
            searchValue: "", //关键字
            showShare: false, //是否显示分享和收藏二个按钮
            isShowSearchPopup: false,
            bottomShow: false,
            searchList: [],
            showStartNav: false,
            naviList: [], //地图路线详情数据
            showRouteLoading: false, //在进行路线规划时出现loading
            showRouteStyle: false,
            showRouteComponent: false,
            showRouteStartPopup: false,
            walkChange: false,
            naviDistance: 0, //路线规划总距离，单位米
            naviTime: 0, // 路线规划花费时间，单位分钟
            showTopNaviPopup: false, //导航过程中的顶部提示信息
            showTopText: null, //导航中顶部文字
            showModalPopup: false, //首页粘贴内容后弹框,
            getModalMessage: null, //获取解码之后的数据
            naviStartDistance: null, //正在导航过程中路线的距离
            naviStartTime: null, //正在导航过程中所需的时间
            naviPositionDirection: null, //正在导航过程中顶部的提示坐标方向
            initShareGoThere: true,
            isShowThisInput: false,
            showMapMarquee: false,
            wxVoiceId: '',
            slideBoardHeight: 0,
            clientHeight: null,
            // 面板上箭头方向
            panelArrawDirectionB: 'INIT',
            panelDirection: 'LOW', // 滑动面板位置
            mask_show: false, // 显示加入房间共享位置蒙板
            creat_show: false, // 创建房间显示隐藏
            exitRoomMark: false, // 退出房间隐藏marker
            roomId: null, // 创建房间号
            mapClickFlag: true, // 共享位置时禁止点击地图
            showCard: true, // 滑动面板显示
            showCardD: 'none', // 滑动面板显示
            // 用戶在搜索框中輸入的内容
            userInputSearchData: '',
            showToastVoice: false, // 显示录音弹框提示
            showToastVoiceFail: false,
            clickTime: null,
            showZh: false,
            showEn: false,
            style1: {
                buttons: [
                    {
                        label: '取消',
                        onClick: this.hideDialog
                    }
                ]
            },
            style2: {
                buttons: [
                    {
                        label: 'Cancel',
                        onClick: this.hideDialog
                    }
                ]
            },
        };


    }

    componentWillReceiveProps(nextProps) {
        console.log(999999999999, nextProps)
        // if(nextProps && nextProps.location.state) {
        //     this.setState({
        //         mask_show: nextProps.location.state.maskShow
        //     })
        // }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        let self = this;
        if (nextProps.location !== this.props.location) {
            this.dispatchSearch(nextProps.location.state);
        }


    }
    onAddHistory = () => {
        let self = this;
        self.child2.searchHistory();
    }

    // 快捷搜索 历史搜索弹框关闭按钮
    onClickPopup = () => {
        let self = this;
        self.moveFlagTouch(true); // 开启滑动面板
        if (self._navi) {
            self._navi.clearAll();
        }
        self.setState({
            bottomShow: false,
            searchValue: "",
            isShowThisInput: true,
            showCardD: 'block'
        });


        document.getElementById('inputId').blur();
        var slideBoard = document.getElementById('slideBoard');
        if (slideBoard) {
            slideBoard.style.top = '45%';
            slideBoard.style.height = '55%';
            curSlideBoardHeight = $(window).height() * 0.55;
        }
        self.setState({
            panelArrawDirectionB: "HALF"
        })
    }
    //点击快捷搜索右边导航图标
    goCurrentHere = () => {
        this.setState({
            showCardD: 'none'
        })
    }

    //主页指定类型的搜索
    onSearchBarSearch = (value) => {
        console.log(value);
        const keyword = value.name;
        const state = {
            searchValue: keyword || '',
        };

        this.setState(state);

        this.handleKeywordSearch(value.name);
    }

    commonFuncHistory = (data) => {
        var self = this;
        self.setState({
            showRoutePopup: true,
            destination: {
                name: data.name,
                ename: data.ename,
                place: {
                    x: data.mapCoord.x,
                    y: data.mapCoord.y,
                    groupID: Number(data.groupID)
                },
                groupID: Number(data.groupID)
            }
        })
        self._navi.setEndPoint({
            url: `${PublicUrl}/images/end.png`,
            width: 30,
            size: 30,
            x: data.mapCoord.x,
            y: data.mapCoord.y,
            groupID: Number(data.groupID)
        }, false);
    }

    commonFuncShareMessage = (data) => {
        var self = this;
        self.setState({
            showRoutePopup: true,
            destination: {
                name: data.name,
                ename: data.ename,
                place: {
                    x: data.centerX,
                    y: data.centerY,
                    groupID: Number(data.groupid)
                },
                groupID: Number(data.groupid)
            }
        })

        self._navi.setEndPoint({
            url: `${PublicUrl}/images/end.png`,
            width: 30,
            size: 30,
            x: data.centerX,
            y: data.centerY,
            groupID: Number(data.groupid)
        }, false);
    }

    //点击常用搜索界面的item
    //切换楼层
    onKeywordDestination = (value) => {
        console.log("value3333333333333333: ", value);
        var self = this;

        //根据跳转传递过来的参数判断是  路线还是分享
        if (value.item) {

            var data = value.item;

            self.changeFloor(Number(data.groupID));

            self.commonFuncHistory(data);

            self.confirmRoutePlan();

        } else if (value.sharePositionMessage) {

            var dataShare = value.sharePositionMessage;

            self.changeFloor(Number(dataShare.groupid));

            self.commonFuncShareMessage(dataShare);

            self.confirmRoutePlan();

        } else if (value.groupID) {
            console.log("搜索历史路线", value);

            var data = value;

            self.changeFloor(Number(data.groupID));

            self.commonFuncHistory(data);

            self.confirmRoutePlan();

        } else {
            console.log("其他搜索记录");
        }

        self.setState({
            isShowThisInput: false
        })

    }

    // 根据搜索类型分配搜索
    dispatchSearch = (locationState) => {
        console.log("dispatchSearch: ", locationState);
        let self = this;

        // TODO 临时设置 位置共享 mask
        if (locationState && locationState.maskShow) {
            self.setState({
                mask_show: locationState.maskShow,
                creat_show: !locationState.maskShow,
                showCard: !locationState.maskShow,
                showCardD: 'none',
                showMapMarquee: !locationState.maskShow,
                showMapInput: !locationState.maskShow,
            });
        }

        if (locationState && locationState.creatShow) {
            self.setState({
                creat_show: locationState.creatShow,
                showCard: !locationState.creatShow,
                showCardD: 'none',
                showMapMarquee: !locationState.creatShow,
                showMapInput: !locationState.creatShow,
            });
        }

        if (locationState && locationState.roomId) {
            self.setState({
                roomId: locationState.roomId
            });
        }

        if (locationState && locationState.maskExit) {
            self.setState({
                mask_show: !locationState.maskExit,
                creat_show: !locationState.maskExit
            });
        }

        if (locationState && locationState.maskJoinShow) {
            self.setState({
                mask_show: locationState.maskJoinShow,
                creat_show: !locationState.maskJoinShow,
                showCard: !locationState.maskJoinShow,
                showCardD: 'none',
                showMapMarquee: !locationState.maskJoinShow,
                showMapInput: !locationState.maskJoinShow,

            });
        }

        if (locationState && locationState.exitRoomMark) {
            self.setState({
                exitRoomMark: locationState.exitRoomMark
            });
        }
        // mapClickFlag为true 允许点击地图
        if (locationState && locationState.mapClickFlag) {
            self.setState({
                mapClickFlag: locationState.mapClickFlag
            });
        }


        if (!locationState) return;
        if (locationState.searchType === "Legend") {
            this.onSearchBarSearch(locationState);
        } else {
            this.onKeywordDestination(locationState);
        }

    }


    // 处理蓝牙数据回调
    handleWechatBLE = (err, data) => {
        // 专门处理蓝牙错误提示
        if (!err) return;
        if (err.type === WechatErrors.WECHAT_SDK) {
            notify.show(`${Lang.InitWechatSDK}`, 'error');
        } else if (err.type === WechatErrors.START_BLE) {
            switch (err.errMsg) {
                case 'startSearchBeacons:ok':
                    notify.hide();
                    break;
                case 'startSearchBeacons:bluetooth power off':
                    notify.show(`${Lang.OpenBlueTooth}`, 'error', -1);
                    break;
                case 'startSearchBeacons:location service disable':
                    notify.show(`${Lang.PhonePosition}`, 'error', -1);
                    break;
                case 'startSearchBeacons:system unsupported':
                    notify.show(`${Lang.MobileSupport}`, 'error', -1);
                    break;
                case 'startSearchBeacons:already started':
                    notify.show(`${Lang.WechatBlueTootth}`, 'error');
                    break;
                default:
                    notify.show(`${Lang.UnKnownBlueTooth}`, 'error');
            }
        }
    };

    //通过快速搜索关键字进行搜索查询信息
    handleKeywordSearch = (value) => {
        console.log('快捷搜索==', value);
        var self = this;
        if (!value) {
            notify.show("请输入内容", 'warning')
            return;
        }


        setTimeout(() => {
            self.moveFlagTouch(false); // 禁止滑动面板
        }, 100)


        var Currentmap = this.map;
        document.activeElement.blur();
        var paramsDcode = KDecoder(value);
        //==========根据value值长度为7进行地址码的解码上marker===========//
        if (value.length === 7 && paramsDcode.floor_id !== null) {
        } else {
            var searchAnalyser = new fengmap.FMSearchAnalyser(Currentmap);
            var searchReq = new fengmap.FMSearchRequest();

            if (value === `${Lang.Food}` || value === `${Lang.Dining}` || value === `${Lang.DiningT}`) {
                searchReq.typeID = [170100, 170300];
            } else if (value === `${Lang.Elevator}`) {
                searchReq.typeID = [170006, 170005, 170003, 170001];
            } else if (value === `${Lang.Toilet}` || value === `${Lang.ToiletCS}` || value === `${Lang.Wash}` || value === `${Lang.ToiletWSJ}`) {
                searchReq.typeID = [100004, 100005, 100001, 100007];
            } else if (value === `${Lang.FloorPosition}`) {
                searchReq.typeID = [120010, 120001, 200001];
            } else if ((value === `${Lang.SubwayExit}`)) {
                // searchReq.typeID = [340100];
                searchReq.typeID = [160005, 140030];
            } else {
                searchReq.keyword = value;//通过关键字进行搜索查询
            }

            searchAnalyser.query(searchReq, function (result) {
                // console.error(9898,result);
                var newArray = result.filter(function (item) {
                    return item.FID !== null && item.groupID !== 1;
                })
                self.setState({
                    searchList: newArray
                })
            });
            this.setState({
                isShowSearchPopup: true,
                bottomShow: true,
                showRouteStyle: false,
                searchValue: value,
                isShowThisInput: false
            });
            document.getElementById('inputId').blur();
            var slideBoard = document.getElementById('slideBoard');
            if (slideBoard) {
                slideBoard.style.top = '45%';
                slideBoard.style.height = '55%';
                curSlideBoardHeight = $(window).height() * 0.55;
            }
            self.setState({
                panelArrawDirectionB: "HALF"
            })
        }


    }

    //点击之后切图切换楼层 + 切换marker
    dataItem = (event, data) => {
        var self = this;
        event.stopPropagation();
        this.changeFloor(data.groupID);
        self.map.mapScaleLevel = 19;
        self.map.rotateTo({
            to: -31,
            time: 1.0
        });
        self.map.moveTo({
            x: data.mapCoord.x + 25,
            y: data.mapCoord.y - 40,
            groupID: Number(data.groupID)
        });
        self._navi.setEndPoint({
            // url: `${PublicUrl}/images/end.png`,
            url: `${PublicUrl}/images/n_other@2x.png`,
            width: 20,
            size: 25,
            x: data.mapCoord.x,
            y: data.mapCoord.y,
            groupID: Number(data.groupID)
        }, false);
    }

    //发送openID返回值code不为0 old 上报位置暂时注释
    async SendOpenIDFunc(data) {
        var paramsObj = {
            openid: LocalCache.get("openID"),
            longitude: data.coord[0],
            latitude: data.coord[1],
            groupid: this._currentFloorId,
            venueuuid: MapId,
            // 该参数没什么用
            clienttype: 1
        }
        await sendOpenIDMessage(paramsObj).then((res) => {
            if (res.code !== 0) {
                console.log("send point faile", paramsObj)
            }
        })
    }


    onShareComponent() {
        var self = this;
        console.log("====>测试分享出去之后上的marker值<====");
        var nameInfo = decodeURI(getUrlParams('name'));
        var enameInfo = getUrlParams('ename');
        self.mapCoordXInfo = getUrlParams('mapCoordX');
        self.mapCoordYInfo = getUrlParams('mapCoordY');
        self.floorIDInfo = getUrlParams('floorID');
        var mapShareType = getUrlParams('shareType').split('/')[0] || null;
        self.changeFloor(Number(self.floorIDInfo));
        let group = this.map.getFMGroup(Number(self.floorIDInfo));
        self.imgMarkerLayer = group.getOrCreateLayer('imageMarker');
        let im = new fengmap.FMImageMarker({
            x: self.mapCoordXInfo,
            y: self.mapCoordYInfo,
            //设置图片路径
            url: `${PublicUrl}/images/icon_location.png`,
            //设置图片显示尺寸
            size: 40,
            height: 40,
            callback: function () {
                // im.alwaysShow();
                console.log("imageMarker添加完成");
            }
        });
        self.imgMarkerLayer.addMarker(im);
        //========实时位置=======//
        if (mapShareType.indexOf("0") !== -1) {
            self.setState({
                showRoutePopup: true,
                showShare: true,
                destination: {
                    name: null,
                    ename: null,
                    place: {
                        x: self.mapCoordXInfo,
                        y: self.mapCoordYInfo,
                        groupID: Number(self.floorIDInfo)
                    },
                    groupID: Number(self.floorIDInfo)
                }
            })
        } else {
            //========POI信息=======//
            self.setState({
                showRoutePopup: true,
                destination: {
                    name: nameInfo,
                    ename: enameInfo,
                    place: {
                        x: self.mapCoordXInfo,
                        y: self.mapCoordYInfo,
                        groupID: Number(self.floorIDInfo)
                    },
                    groupID: Number(self.floorIDInfo)
                }
            })
            //通过URL截取mapFID  再去地图查询对应的数据信息
            var mapCoordFID = getUrlParams('mapCoordFID');

            var searchAnalyserShareFID = new fengmap.FMSearchAnalyser(self.map);

            var searchReqShareFiD = new fengmap.FMSearchRequest();

            searchReqShareFiD.FID = mapCoordFID;

            searchAnalyserShareFID.query(searchReqShareFiD, function (result) {
                self.poiAllInfo = result[0].target;
            });

            self.uploadPOIMessage(self.poiAllInfo);
        }
    }

    //解决H5页面在iOS系统中滑动回弹效果(橡皮筋效果)导致的穿透问题 参考文档 http://www.10qianwan.com/articledetail/651162.html
    componentWillMount() {
        let u = navigator.userAgent
        if (u.indexOf('iPhone') > -1) {
            inobounce.enable();
        }
    }

    componentWillUnmount() {
        inobounce.disable();
    }

    componentDidMount() {
        var self = this;
        var last_rotation_degree = 0;
        var last_map_rotation_degree = 0;
        //fengmap
        const map = createFMMap();

        if (Locale === 'en') {
            map.labelLanguage = fengmap.FMLanguageType.EN;
            self.showMapLanguage = fengmap.FMLanguageType.EN
        } else {
            self.showMapLanguage = fengmap.FMLanguageType.ZH;
            map.labelLanguage = fengmap.FMLanguageType.ZH;
        }
        // 处理定位点的方向
        setNaviListener('orientation', function (err, compass) {
            if (!err) {
                //if(self._locationMarker && self.naviSwitch === false){
                //   let rotation_degree = (360-compass) % 360;
                //   if (Math.abs(rotation_degree - last_rotation_degree ) > 350) {
                //       rotation_degree = rotation_degree - 360;
                //   }
                // self._locationMarker.rotateTo({to: rotation_degree, duration: 0});
                //   last_rotation_degree = rotation_degree ;
                //}
                let rotation_degree = (360 - compass) % 360;
                if (Math.abs(rotation_degree - last_rotation_degree) > 180) {
                    rotation_degree = rotation_degree - 360;
                }
                //标签存在
                if (self._locationMarker) {
                    self._locationMarker.rotateTo({to: rotation_degree, duration: 0});
                }
                last_rotation_degree = rotation_degree;
                // console.log(rotation_degree);
                //导航状态同时地图已经加载完成时
                if (self.naviSwitch && self.mapIsOk) {
                    let map_rotation_degree = 360 - (360 - compass) % 360;
                    if (Math.abs(map_rotation_degree - last_map_rotation_degree) > 180) {
                        map_rotation_degree = map_rotation_degree - 360;
                    }
                    self.map.rotateTo({
                        to: map_rotation_degree,
                        time: 1.0
                    });
                    last_map_rotation_degree = map_rotation_degree;
                }
                //转地图
                if (self._locationMarker) {
                    let map_rotation_degree = 360 - (360 - compass) % 360;
                    if (Math.abs(map_rotation_degree - last_map_rotation_degree) > 180) {
                        map_rotation_degree = map_rotation_degree - 360;
                    }
                    if (self.state.walkChange) {
                        self.map.rotateTo({
                            to: map_rotation_degree,
                            time: 1.0
                        });
                    }
                    last_map_rotation_degree = map_rotation_degree;
                }
            } else {
                self.queueNotify(`${Lang.FailedCompass}`, 'error');
            }


        });
        // 处理定位点的坐标更新
        setNaviListener('motion', function (err, data) {
            console.log('位点的坐标更新，data必须有值：=======', data);
            // data 格式
            //coord: (2) [13503195.945291389, 3657731.5211778902]
            // floorId: "2"
            if (!err) {
                if (self.mapIsOk) {
                    //切换室内
                    // if(data){
                    //     self.setState({
                    //       showMapInput: true
                    //     })
                    // }
                    self.LogInt = data;
                    if (self.openID !== "" && self.openID !== null && self.openID !== undefined) {
                        self.SendOpenIDFunc(self.LogInt)
                    }

                    self._currentCootd = data.coord;

                    console.log("======>self._currentFloorId<=====", self._currentFloorId);

                    var getGroupId = data.floorId;

                    if (!getGroupId) {
                        getGroupId = self._currentFloorId
                    } else {
                        getGroupId = Number(data.floorId)
                    }

                    //导航状态
                    if (self.naviSwitch === true) {

                        self.changeFloor(getGroupId);

                        self.theCoord = {x: data.coord[0], y: data.coord[1], groupID: getGroupId};
                        self._navi.locate(self.theCoord);

                    } else {
                        //非导航状态
                        self.updateLocation(data);

                        if (self.state.walkChange || self.state.locationStatus === 2) {

                            self.changeFloor(getGroupId);

                            self.map.moveTo({x: data.coord[0], y: data.coord[1], groupID: getGroupId, time: 1.5});

                            if (self._locationMarker) {
                                self._locationMarker.moveTo({
                                    x: data.coord[0],
                                    y: data.coord[1],
                                    time: 1.5,
                                    groupID: getGroupId
                                });
                            }
                        } else {
                            console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh", getGroupId);
                            if (!self._locationMarker) {
                                self._locationMarker = new fengmap.FMLocationMarker({
                                    //x坐标值
                                    x: data.coord[0],
                                    //y坐标值
                                    y: data.coord[1],
                                    //图片地址
                                    url: `${PublicUrl}/images/pointer.png`,
                                    //楼层id
                                    groupID: getGroupId,
                                    //图片尺寸
                                    size: 30,
                                    //marker标注高度
                                    height: 3
                                })
                                self.map.addLocationMarker(self._locationMarker);
                            } else {
                                self._locationMarker.moveTo({
                                    x: data.coord[0],
                                    y: data.coord[1],
                                    time: 1.5,
                                    groupID: getGroupId
                                });
                            }
                        }

                    }
                }
            } else {
                self.queueNotify(`${Lang.SupportIphone}`, 'error');
            }
        });

        const {location} = this.props;
        console.log("location.state", location.state);
        this.dispatchSearch(location.state);
        // 打开地图
        map.openMapById(MapOptions.fmapID);

        map.on('loadComplete', function () {
            console.log('地图加载完成');
            // 地图加载完成后，显示滑动面板
            self.setState({
                showCardD: 'block'
            })
            self.map.moveTo({
                x: 13502763.66374543,
                y: 3657684.0809
            });
            // 地图加载完成后，才开始获取蓝牙数据
            initialWechatBLE(self.handleWechatBLE);
            // 开启惯导+方向
            startNavigation();

            // 显示楼层切换按钮   楼层控制控件配置参数
            var ctlOpt = new fengmap.controlOptions({
                position: fengmap.controlPositon.LEFT_BOTTOM,//默认在右上角
                showBtnCount: 6,  //默认显示楼层的个数
                allLayer: false,   //初始是否是多层显示，默认单层显示
                needAllLayerBtn: false, //是否显示多层/单层切换按钮
                //位置x,y的偏移量
                offset: {
                    x: 14,
                    y: -2200
                }
            });

            self.groupControl = new fengmap.FMButtonGroupsControl(map, ctlOpt);

            self.groupControl.onChange(function (groups, allLayer) {
                self._viewCurrentFloorId = groups[0];
            });

            /**
             * 初始化路径导航对象
             */
            if (!self._navi) {
                self._navi = new fengmap.FMNavigation({
                    //地图对象
                    map: map,
                    naviLanguage: self.showMapLanguage,
                    //导航中路径规划模式, 支持最短路径、最优路径两种。默认为MODULE_SHORTEST, 最短路径。
                    naviMode: fengmap.FMNaviMode.MODULE_SHORTEST,
                    //导航中的路线规划梯类优先级, 默认为PRIORITY_DEFAULT, 详情参考FMNaviPriority。
                    naviPriority: fengmap.FMNaviPriority.PRIORITY_DEFAULT,
                    //调用drawNaviLine绘制导航线时, 是否清除上次调用drawNaviLine绘制的导航线, 默认为true
                    autoClearNaviLine: true,
                    //定位标注与楼层之间的高度偏移设置。默认是3。
                    locationMarkerHeight: 10,
                    //导航线与楼层之间的高度偏移设置。默认是1。
                    lineMarkerHeight: 10,
                    // 设置导航线的样式
                    lineStyle: {
                        // 导航线样式
                        lineType: fengmap.FMLineType.FMARROW,
                        // 设置线的宽度
                        lineWidth: 6,
                        //设置线动画,false为动画
                        noAnimate: true,
                        smooth: true
                    }
                });
            }

            self.mapIsOk = true;

            //创建路径分析对象
            self.naviAnalyser = new fengmap.FMNaviAnalyser();
            //通过已加载的地图数据加载模型
            self.naviAnalyser.init(self.map);//注意：此方法需保证map数据已加载完成，可在map的loadComplete事件后调用

            self.getPermision();

            self.setState({
                isShowLoading: false,
                showLocateBtn: true,
                showMapInput: true,
                isShowThisInput: true,
                showMapMarquee: true,
            });

            if (self.mapIsOk) {

                getAllPoiListCache(); //获取POI

                // self.pickModelFilter(); //过滤模型

                self.saveUserMessage(); //保存用户的访问记录

                //=======处理粘贴板的内容=======//
                self.handleCopyKCode(self.state.searchValue);
                //判断路径上是否有shareType参数
                if (getUrlParams('shareType')) {
                    self.onShareComponent();
                } else {

                }
            }
            //每四秒获取一次gps数据
            gpstimer = setInterval(getGeoLocation, 4000);


            // android 监听键盘弹起收起
            var originalHeight = document.documentElement.clientHeight || document.body.clientHeight;
            window.onresize = function () {
                //键盘弹起与隐藏都会引起窗口的高度发生变化
                var resizeHeight = document.documentElement.clientHeight || document.body.clientHeight;
                if (resizeHeight - 0 < originalHeight - 0) {
                    //当软键盘弹起，在此处操作
                    console.error('android键盘弹起');
                    var bottomFooter = document.getElementById('bottomFooter');
                    bottomFooter.style.display = 'none';
                    var slideBoard = document.getElementById('slideBoard');
                    if (slideBoard) {
                        slideBoard.style.top = '5%';
                        slideBoard.style.height = '95%';
                        curSlideBoardHeight = $(window).height() * 0.95;
                    }

                    self.setState({
                        panelArrawDirectionB: "ALL"
                    })

                } else {
                    //当软键盘收起，在此处操作
                    console.error('android键盘收起');
                    var bottomFooter = document.getElementById('bottomFooter');
                    bottomFooter.style.display = 'block';
                    var slideBoard = document.getElementById('slideBoard');
                    if (slideBoard) {
                        slideBoard.style.top = '45%';
                        slideBoard.style.height = '55%';
                        curSlideBoardHeight = $(window).height() * 0.55;
                    }
                    self.setState({
                        panelArrawDirectionB: "HALF"
                    })
                }
            };

            // //    IOS 监听键盘
            // var u = navigator.userAgent;
            // //  var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
            // var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
            // let inputId = document.getElementById('inputId');
            // // ios 端键盘弹起在输入框组件中获取焦点处理，这里注释掉没用到
            // inputId.addEventListener('focusin', () => {
            //     // var slideBoard = document.getElementById('slideBoard');
            //     //软键盘弹出的事件处理
            //     if (isiOS) {
            //         console.error('IOS键盘弹起', isiOS);
            //         // var slideBoard = document.getElementById('slideBoard');
            //         // if (slideBoard) {
            //         //     slideBoard.style.top = '5%';
            //         //     slideBoard.style.height = '95%';
            //         // }
            //         // curSlideBoardHeight = $(window).height() * 0.95; //会产生缩放?
            //
            //         // self.setState({
            //         //     panelArrawDirectionB: "ALL"
            //         // })
            //         // document.body.scrollTop = 0;
            //         // var historySearch = document.getElementById('historySearch');
            //         // historySearch.style.display = 'none';
            //         // var bottomFooter = document.getElementById('bottomFooter');
            //         // bottomFooter.style.display = 'none';
            //
            //     }
            // })

            // inputId.addEventListener('focusout', () => {
            //     //软键盘收起的事件处理
            //     if (isiOS) {
            //         console.error('IOS键盘收起', isiOS);
            //         // var slideBoard = document.getElementById('slideBoard');
            //         // if (slideBoard) {
            //         //     slideBoard.style.top = '45%';
            //         //     slideBoard.style.height = '55%';
            //         //     curSlideBoardHeight = $(window).height() * 0.55;
            //         // }
            //         // self.setState({
            //         //     panelArrawDirectionB: "HALF"
            //         // })
            //
            //         // var historySearch = document.getElementById('historySearch');
            //         // historySearch.style.display = 'none';
            //         // var bottomFooter = document.getElementById('bottomFooter');
            //         // bottomFooter.style.display = 'block';
            //         // document.body.scrollTop = 0;
            //
            //     }
            // })


        })

        // map.pickFilterFunction = () => false;
        map.on('mapClickNode', function (event) {
            console.log('点击地图111：', self.state.mapClickFlag, event);
            console.log(1111111111, self.state.showRoutePopup);
            if (self.state.mapClickFlag) {
                if (self.mapIsOk) {
                    if (self.naviSwitch !== true) {
                        const floorModel = event.target;
                        const floorInfo = event.eventInfo;
                        if (floorModel == null || floorModel.FID === undefined) {
                            self._navi.clearAll();
                            self.setState({showRoutePopup: false, showNaviPopup: false});
                            return;
                        }

                        if (self.state.showStartNav) {
                            self.setState({showStartNav: false});
                        }

                        if (self.state.bottomShow) {

                            notify.show(`${Lang.CloseDialog}`, 'warning');

                        } else {
                            //处理模型高亮
                            let _filterTypes = ["130100", "200000", "190600", "200111", "200209", "200013", "260100", "130201", "100000", "210601", "130200", "130300", "200100", "120200", "200110", "120300", "140101"];
                            if (_filterTypes.indexOf(floorModel.typeID.toString()) >= 0) {
                                floorModel.selected = false;
                                return;
                            } else {
                                if (self.selectedModel) {
                                    self.selectedModel.selected = false;
                                }
                                floorModel.selected = true;
                                self.selectedModel = floorModel;
                            }
                            self._navi.clearAll();
                            self.setState({
                                locationStatus: 1,
                                walkChange: false,
                                isShowThisInput: false,
                                showMapInput: false
                            });

                            if (getUrlParams('shareType')) {
                                self.setState({
                                    initShareGoThere: false
                                });
                            }

                            if (floorModel.name === null && floorModel.ename === null) {
                                self.setState({
                                    showShare: true,
                                    destination: {
                                        name: floorModel.name,
                                        ename: floorModel.ename,
                                        place: {
                                            x: floorInfo.coord.x,
                                            y: floorInfo.coord.y,
                                            groupID: Number(floorModel.groupID)
                                        },
                                        groupID: Number(floorModel.groupID)
                                    }
                                });
                            } else {
                                self.setState({
                                    showRouteLoading: false,
                                    showShare: false,
                                    isCollectMessage: false,
                                    showRoutePopup: true,
                                    showCardD: 'none',
                                    destination: {
                                        name: floorModel.name,
                                        ename: floorModel.ename,
                                        place: {
                                            x: floorInfo.coord.x,
                                            y: floorInfo.coord.y,
                                            groupID: Number(floorModel.groupID)
                                        },
                                        groupID: Number(floorModel.groupID)
                                    }
                                });
                            }

                            if (floorModel.FID !== null && floorModel.name !== null) {
                                self._navi.setEndPoint({
                                    url: `${PublicUrl}/images/end.png`,
                                    width: 30,
                                    size: 30,
                                    x: floorModel.mapCoord.x,
                                    y: floorModel.mapCoord.y,
                                    groupID: Number(floorModel.groupID)
                                }, false);
                                self.uploadPOIMessage(floorModel);
                            }

                        }
                    } else {
                        notify.show(`${Lang.NowNaviPosition}`, 'warning');
                    }
                } else {
                    notify.show(`${Lang.MapNotReslize}`, 'warning');
                }
            }

        })


        this.map = map;


        // wwf


        var slideBoard = document.getElementById('slideBoard');
        // initSlideBoard(slideBoard); // 将slideBoard 传给touchCard组件
        initSlideBoard();
        self.state.clientHeight = document.documentElement.clientHeight // 获取屏幕高度

        // 滑动面板js 开始
        var slideBoard = document.getElementById('slideBoard');
        var distance;
        var distanceStart;
        var distanceEnd;

        function initSlideBoard() {
            // slideBoard = slideObj;
            slideBoard.style.top = Math.ceil($(window).height() * initRate) + "px";
            slideBoard.style.height = Math.ceil($(window).height() * (1 - initRate)) + "px";
            // 参考文档 https://blog.csdn.net/lijingshan34/article/details/88350456
            slideBoard.addEventListener('touchstart', touchStart, {passive: false});
        }



        //滑动开始事件  mobile
        function touchStart(e) {
            if (moveFlag) {
                console.log(25252525, Math.abs(curSlideBoardHeight - parseInt(slideBoard.style.height)));
                console.log("adas", curSlideBoardHeight, slideBoard.style.height)

                self.state.slideBoardHeight = parseInt(slideBoard.style.height);
                self.clickTime = new Date().getTime();
                console.log('touchStart000000', e.touches[0])
                console.log('touchStart111', self.clickTime, e.touches[0].clientY);
                distanceStart = e.touches[0].clientY;
                if (e.touches[0].clientY >= parseInt(slideBoard.style.top)) {
                    mobileOldY = e.touches[0].clientY;
                    moblieTop = parseInt(slideBoard.style.top);
                    mobileOldTIME = new Date().getTime();

                    slideBoard.addEventListener('touchmove', touchMove, {passive: false});
                    slideBoard.addEventListener('touchend', touchEnd, {passive: false});
                }

            }

        }

        function touchMove(e) {
            if (moveFlag) {
                // 当接近屏幕顶端25px时候禁止上滑
                if (parseInt(slideBoard.style.top) > 25) {
                    console.log('touchMove');
                    e.preventDefault();
                    var logoDao = document.getElementById('logoDao');
                    self.state.slideBoardHeight = parseInt(slideBoard.style.height);
                    var y = e.touches[0].clientY - mobileOldY;
                    slideBoard.style.top = moblieTop + y + "px";
                    slideBoard.style.height = $(window).height() - y - moblieTop + "px";
                    if (parseInt(slideBoard.style.top) < 0) {
                        slideBoard.style.top = 0;
                    }
                    if (parseInt(slideBoard.style.top) > Math.ceil($(window).height()
                        * initRate)) {
                        slideBoard.style.top = Math.ceil($(window).height() * initRate) + "px";
                        slideBoard.style.height = Math.ceil($(window).height() * (1 - initRate)) + "px";
                    }
                }

            }
        }

        // function touchEnd(e) {
        //     console.log('touchEnd', e);
        //     distanceEnd = e.changedTouches[0].clientY;
        //     console.log(233333333, curSlideBoardHeight, parseInt(slideBoard.style.height));
        //     console.log("abs:", curSlideBoardHeight, parseInt(slideBoard.style.height));
        //     console.log(111112555, Math.abs(curSlideBoardHeight - parseInt(slideBoard.style.height)));
        //     if (Math.abs(curSlideBoardHeight - parseInt(slideBoard.style.height)) <= 1 || parseInt(slideBoard.style.height) == 55 || parseInt(slideBoard.style.height) == 25) {
        //         console.log(25252525, Math.abs(curSlideBoardHeight - parseInt(slideBoard.style.height)));
        //         slideBoard.removeEventListener('touchmove', touchMove, {passive: false});
        //         slideBoard.removeEventListener('touchend', touchEnd, {passive: false});
        //         return;
        //     }
        //     let rate = Math.abs(self.clickTime - new Date().getTime());
        //     //如果是点击图片click事件，不处理
        //     if (((e.target.id == "imgClick" && rate < 150) || e.target.className.indexOf("img-icon") > -1 || e.target.className.indexOf("weui-icon-clear") > -1)) {
        //         console.error("0089876766", rate);
        //         slideBoard.removeEventListener('touchmove', touchMove, {passive: false});
        //         slideBoard.removeEventListener('touchend', touchEnd, {passive: false});
        //         return;
        //     }
        //     distance = Math.abs(parseInt(distanceEnd) - parseInt(distanceStart));
        //     console.log("distince: ", distance, distanceStart, distanceEnd);
        //     if (distance < 99) {
        //         console.log(99999,self.state.panelArrawDirectionB);
        //         switch (self.state.panelArrawDirectionB) {
        //             case 'ALL':
        //                 moveSlideBoardTo(3);
        //                 curSlideBoardHeight = $(window).height() * 0.95;
        //                 self.setState({
        //                     panelArrawDirectionB: "ALL"
        //                 });
        //                 if (logoDao) {
        //                     logoDao.style.top = "40%";
        //                 }
        //                 break;
        //             case 'HALF':
        //                 moveSlideBoardTo(2);
        //                 curSlideBoardHeight = $(window).height() * 0.55;
        //                 self.setState({
        //                     panelArrawDirectionB: "HALF"
        //                 });
        //                 if (logoDao) {
        //                     logoDao.style.top = "40%";
        //                 }
        //                 break;
        //             case 'INIT':
        //                 moveSlideBoardTo(1);
        //                 curSlideBoardHeight = $(window).height() * 0.25;
        //                 self.setState({
        //                     panelArrawDirectionB: "INIT"
        //                 });
        //                 if (logoDao) {
        //                     logoDao.style.top = "70%";
        //                 }
        //                 break;
        //         }
        //         slideBoard.removeEventListener('touchmove', touchMove, {passive: false});
        //         slideBoard.removeEventListener('touchend', touchEnd, {passive: false});
        //         return;
        //     }
        //     console.error("qqqqq", parseInt(slideBoard.style.height), parseInt(slideBoard.style.top), $(window).height());
        //     slideBoard.removeEventListener('touchmove', touchMove, {passive: false});
        //     slideBoard.removeEventListener('touchend', touchEnd, {passive: false});
        //     var logoDao = document.getElementById('logoDao');
        //     let afterHeght = parseInt(slideBoard.style.height);
        //     //初始高度- 最后高度 ,负值上滑，正值下滑
        //     if ((self.state.slideBoardHeight - afterHeght) > 0) {//下滑
        //         if (parseInt(slideBoard.style.top) >= Math.ceil($(window).height() * 0.55)) {
        //             moveSlideBoardTo(1);
        //             self.setState({
        //                 panelArrawDirectionB: "INIT"
        //             })
        //
        //             if (logoDao) {
        //                 logoDao.style.top = "70%";
        //             }
        //         } else if (parseInt(slideBoard.style.top) >= Math.ceil($(window).height() * 0.15)) {
        //             moveSlideBoardTo(2);
        //
        //             self.setState({
        //                 panelArrawDirectionB: "HALF"
        //             })
        //
        //             if (logoDao) {
        //                 logoDao.style.top = "40%";
        //             }
        //
        //         } else if (parseInt(slideBoard.style.top) <= Math.ceil($(window).height() * 0.25)) {
        //             console.log('下滑3333333333');
        //
        //             moveSlideBoardTo(3);
        //             self.setState({
        //                 panelArrawDirectionB: "ALL"
        //             })
        //             if (logoDao) {
        //                 logoDao.style.top = "40%";
        //             }
        //         }
        //
        //     } else {//上滑
        //         if (parseInt(slideBoard.style.top) <= Math.ceil($(window).height() * 0.25)) {
        //             console.log('上滑3333333333');
        //             moveSlideBoardTo(3);
        //             curSlideBoardHeight = $(window).height() * 0.95;
        //             self.setState({
        //                 panelArrawDirectionB: "ALL"
        //             })
        //             if (logoDao) {
        //                 logoDao.style.top = "40%";
        //             }
        //         } else if (parseInt(slideBoard.style.top) <= Math.ceil($(window).height() * 0.6)) {
        //             moveSlideBoardTo(2);
        //             curSlideBoardHeight = $(window).height() * 0.55;
        //             self.setState({
        //                 panelArrawDirectionB: "HALF"
        //             })
        //             if (logoDao) {
        //                 logoDao.style.top = "40%";
        //             }
        //         } else {
        //             moveSlideBoardTo(1);
        //             curSlideBoardHeight = $(window).height() * 0.25;
        //             self.setState({
        //                 panelArrawDirectionB: "INIT"
        //             })
        //
        //             if (logoDao) {
        //                 logoDao.style.top = "70%";
        //             }
        //         }
        //     }
        //
        // }



        function touchEnd(e) {
            console.log('touchEnd', e);
            console.log('sdfsf', e);
            var logoDao = document.getElementById('logoDao');
            // distanceEnd = e.changedTouches[0].clientY;
            // console.log(233333333, curSlideBoardHeight, parseInt(slideBoard.style.height));
            // console.log("abs:", curSlideBoardHeight, parseInt(slideBoard.style.height));
            // console.log(111112555, Math.abs(curSlideBoardHeight - parseInt(slideBoard.style.height)));
            // if (Math.abs(curSlideBoardHeight - parseInt(slideBoard.style.height)) <= 1 || parseInt(slideBoard.style.height) == 55 || parseInt(slideBoard.style.height) == 25) {
            //     console.log(25252525, Math.abs(curSlideBoardHeight - parseInt(slideBoard.style.height)));
            //     document.removeEventListener('touchmove', touchMove, {passive: false});
            //     document.removeEventListener('touchend', touchEnd, {passive: false});
            //     return;
            // }
            // let rate = Math.abs(self.clickTime - new Date().getTime());
            // //如果是点击图片click事件，不处理
            // if (((e.target.id == "imgClick" && rate < 150) || e.target.className.indexOf("img-icon") > -1 || e.target.className.indexOf("weui-icon-clear") > -1)) {
            //     console.error("0089876766", rate);
            //     document.removeEventListener('touchmove', touchMove, {passive: false});
            //     document.removeEventListener('touchend', touchEnd, {passive: false});
            //     return;
            // }
            // distance = Math.abs(parseInt(distanceEnd) - parseInt(distanceStart));
            // console.log("distince: ", distance, distanceStart, distanceEnd);
            // if (distance < 99) {
            //     console.log(99999);
            //     switch (self.state.panelArrawDirectionB) {
            //         case 'ALL':
            //             moveSlideBoardTo(3);
            //             curSlideBoardHeight = $(window).height() * 0.95;
            //             self.setState({
            //                 panelArrawDirectionB: "ALL"
            //             });
            //             if (logoDao) {
            //                 logoDao.style.top = "40%";
            //             }
            //             break;
            //         case 'HALF':
            //             moveSlideBoardTo(2);
            //             curSlideBoardHeight = $(window).height() * 0.55;
            //             self.setState({
            //                 panelArrawDirectionB: "HALF"
            //             });
            //             if (logoDao) {
            //                 logoDao.style.top = "40%";
            //             }
            //             break;
            //         case 'INIT':
            //             moveSlideBoardTo(1);
            //             curSlideBoardHeight = $(window).height() * 0.25;
            //             self.setState({
            //                 panelArrawDirectionB: "INIT"
            //             });
            //             if (logoDao) {
            //                 logoDao.style.top = "70%";
            //             }
            //             break;
            //     }
            //     document.removeEventListener('touchmove', touchMove, {passive: false});
            //     document.removeEventListener('touchend', touchEnd, {passive: false});
            //     return;
            // }
            document.removeEventListener('touchmove', touchMove, {passive: false});
            document.removeEventListener('touchend', touchEnd, {passive: false});

            curSlideBoardHeight = parseInt(slideBoard.style.height);
            // 0.1  0.5  0.75
            if (parseInt(slideBoard.style.top) < Math.ceil($(window).height() * 0.15)) {
                moveSlideBoardTo(3);
                curSlideBoardHeight = $(window).height() * 0.95;
                self.setState({
                    panelArrawDirectionB: "ALL"
                })
                if (logoDao) {
                    logoDao.style.top = "40%";
                }


            } else if (parseInt(slideBoard.style.top) < Math.ceil($(window).height() * 0.5)) {
                moveSlideBoardTo(2);
                curSlideBoardHeight = $(window).height() * 0.55;
                self.setState({
                    panelArrawDirectionB: "HALF"
                })
                if (logoDao) {
                    logoDao.style.top = "40%";
                }


            } else if (parseInt(slideBoard.style.top) < Math.ceil($(window).height() * 0.75)) {
                moveSlideBoardTo(1);
                curSlideBoardHeight = $(window).height() * 0.25;
                self.setState({
                    panelArrawDirectionB: "INIT"
                })

                if (logoDao) {
                    logoDao.style.top = "70%";
                }

            }

        }



        // 面板回到刚才的位置
        // function panelToOldPosition() {
        //     console.log("面板回到刚才的位置", this);
        //     let self = this;
        //     var logoDao = document.getElementById('logoDao');
        //     switch (self.state.panelArrawDirectionB) {
        //         case 'ALL':
        //             moveSlideBoardTo(3);
        //             curSlideBoardHeight = $(window).height() * 0.95;
        //             self.setState({
        //                 panelArrawDirectionB: "ALL"
        //             });
        //             if (logoDao) {
        //                 logoDao.style.top = "40%";
        //             }
        //             break;
        //         case 'HALF':
        //             moveSlideBoardTo(2);
        //             curSlideBoardHeight = $(window).height() * 0.55;
        //             self.setState({
        //                 panelArrawDirectionB: "HALF"
        //             });
        //             if (logoDao) {
        //                 logoDao.style.top = "40%";
        //             }
        //             break;
        //         case 'INIT':
        //             moveSlideBoardTo(1);
        //             curSlideBoardHeight = $(window).height() * 0.25;
        //             self.setState({
        //                 panelArrawDirectionB: "INIT"
        //             });
        //             if (logoDao) {
        //                 logoDao.style.top = "70%";
        //             }
        //             break;
        //     }
        // }

        //移动滑板到某位置  mobile PC
        function moveSlideBoardTo(location) {
            console.log('location00:', location)
            var moveTime = 100;
            // var moveIntervalTime = 10;
            var moveIntervalTime = 100;
            var locationRate = 1;
            var rate = moveTime / moveIntervalTime;
            loopCount = 0;

            if (location == 1) {
                locationRate = 0.25;
            } else if (location == 2) {
                locationRate = 0.55;
            } else if (location == 3) {
                locationRate = 0.95;
            }

            if (Math.ceil((1 - locationRate) * $(window).height()) == parseInt(slideBoard.style.top)) {
                return;
            } else if (Math.ceil((1 - locationRate) * $(window).height()) < parseInt(slideBoard.style.top)) {//需要上升
                var dist = parseInt(slideBoard.style.top) - (1 - locationRate) * $(window).height();
                var perdist = Math.ceil(dist / rate);
                loopID = setInterval(() => {
                    moveUp(perdist, rate, locationRate)
                }, moveIntervalTime);

            } else {//下降
                var dist = (1 - locationRate) * $(window).height() - parseInt(slideBoard.style.top);
                var perdist = Math.ceil(dist / rate);
                loopID = setInterval(() => {
                    moveDown(perdist, rate, locationRate)
                }, moveIntervalTime);
            }
        }

        //上移函数
        function moveUp(perdist, rate, locationRate) {
            // console.log('up:', perdist, rate, locationRate)
            if (loopCount != rate) {
                slideBoard.style.top = parseInt(slideBoard.style.top) - perdist + "px";
                slideBoard.style.height = $(window).height() - parseInt(slideBoard.style.top) + "px";
                loopCount = loopCount + 1;
            } else {
                slideBoard.style.top = Math.ceil((1 - locationRate) * $(window).height()) + "px";
                slideBoard.style.height = $(window).height() - parseInt(slideBoard.style.top) + "px";
                clearInterval(loopID);
            }
        }

        //下移函数
        function moveDown(perdist, rate, locationRate) {
            // console.log('moveDown:', perdist, rate, locationRate)
            if (loopCount != rate) {
                slideBoard.style.top = parseInt(slideBoard.style.top) + perdist + "px";
                slideBoard.style.height = $(window).height() - parseInt(slideBoard.style.top) + "px";
                loopCount = loopCount + 1;
            } else {
                slideBoard.style.top = Math.ceil((1 - locationRate) * $(window).height()) + "px";
                slideBoard.style.height = $(window).height() - parseInt(slideBoard.style.top) + "px";
                clearInterval(loopID);
            }
        }

        // 滑动面板js 结束

        // 位置共享marker 定时暂时注释
        // timerInter = setInterval(() => {
        //     layer.removeAll();
        //     // 退出房间返回清除marker
        //     // if(self.state.exitRoomMark) {
        //     //     layer.removeAll();
        //     // }
        //     // 位置共享marker
        //     if (self.state.mask_show == true) {
        //         // 参考文档 https://www.fengmap.com/develop-js-guide-point.html
        //         //位置共享给地图添加 本人Marker
        //         // self._locationMarker = new fengmap.FMLocationMarker({
        //         //     //x坐标值
        //         //     x: 13502771.760876795,
        //         //     //y坐标值
        //         //     y: 3657370.4721014188,
        //         //     //图片地址
        //         //     url: `${PublicUrl}/images/pointer.png`,
        //         //     // url: `${PublicUrl}/images/n_self@2x.png`,  // public/images/n_self@2x.png
        //         //     //楼层id
        //         //     groupID: 2,
        //         //     //图片尺寸
        //         //     size: 25,
        //         //     //marker标注高度
        //         //     height: 3
        //         // })
        //         // self.map.addLocationMarker(self._locationMarker);
        //
        //         var currentPostionShareInfoFa = LocalCache.get('currentPostionShareInfo');
        //         var currentPostionShareInfo = [];
        //         var userInfo = LocalCache.get('userInfo');
        //
        //
        //         if (currentPostionShareInfoFa.length > 1) {
        //             for (let i = 0, len = currentPostionShareInfoFa.length; i < len; i++) {
        //                 if (currentPostionShareInfoFa[i].mobilePhone !== userInfo.mobilePhone) {
        //                     currentPostionShareInfo.push(currentPostionShareInfoFa[i]);
        //                 }
        //             }
        //             for (let i = 0, len = currentPostionShareInfo.length; i < len; i++) {
        //                 // var groupLayer = self.map.getFMGroup(1);
        //                 var groupLayer = self.map.getFMGroup(currentPostionShareInfo[i].groupid);
        //
        //                 // var layer = new fengmap.FMTextMarkerLayer();   //实例化TextMarkerLayer
        //                 groupLayer.addLayer(layer);    //添加文本标注层到模型层。否则地图上不会显示
        //
        //                 //图标标注对象，默认位置为该楼层中心点
        //                 var im = new fengmap.FMImageMarker({
        //                     x: currentPostionShareInfo[i].x,
        //                     y: currentPostionShareInfo[i].y,
        //                     url: `${PublicUrl}/images/n_other@2x.png`,       //设置图片路径
        //                     size: 25,                               //设置图片显示尺寸 25
        //                     height: 5,                              //标注高度，大于model的高度 5
        //                 });
        //                 layer.addMarker(im);  //图片标注层添加图片Marker
        //                 im.alwaysShow();  // 在图片载入完成后，设置 "一直可见"，不被其他层遮挡
        //                 // layer.removeMarker(im);
        //
        //                 //图标标注对象，默认位置为该楼层中心点
        //                 var tm = new fengmap.FMTextMarker({
        //                     name: currentPostionShareInfo[i].nickname,
        //                     x: Number(currentPostionShareInfo[i].x) - 20,
        //                     y: Number(currentPostionShareInfo[i].y) + 50, // 相对于图片位置加80
        //                     //文字标注样式设置
        //                     fillcolor: "0,0,0", //填充色
        //                     fontsize: 20, //字体大小
        //                     strokecolor: "255,255,255", //边框色
        //                     alpha: 1   //文本标注透明度
        //                 });
        //                 layer.addMarker(tm);  //文本标注层添加文本Marker
        //                 tm.alwaysShow();    // 在marker载入完成后，设置 "一直可见"，不被其他层遮挡
        //
        //                 // layer.removeMarker(tm);
        //                 // layer.removeAll();
        //             }
        //         }
        //
        //         // setTimeout(() => {
        //         //     clearInterval(timerInter)
        //         // },5000)
        //     }
        //
        // }, 100);

    }

    //当点击快捷搜索，禁止滑动面板滑动
    moveFlagTouch(e) {
        console.log('dddddddddd', e);
        moveFlag = e;
    }

    componentWillUnmount() {
        // this.destroyMap();
        stopNavigation();
        if (gpstimer != null) {
            clearInterval(gpstimer);
        }
    }

    async getPermision() {
        var that = this;
        var paramsObj = {
            // mobiletype: "20bc6effc2eb5c3ba3deafb6d5f8ab41"
            "apptype": AppType,
            "venueuuid": MapId,
            "appcode": AppCode
        }
        await buttonPermision(paramsObj).then((res) => {
            console.log('getPermision6666677=====', res)
            if (res.code !== 0) {
                notify.show(`${Lang.TimeOut}`, 'error');
            } else {
                that.setState({
                    permisionList: res.data || []
                });
            }
        })
    }

    saveUserMessage = () => {
        var paramsObj = {
            unid: LocalCache.get("openID"),
            venueuuid: MapId,
            // clienttype: "1",
            appcode: AppCode,
            apptype: AppType
        }
        saveUserRequest(paramsObj).then((res) => {
            console.log("saveUserMessage====>", res)
        })
    }

    uploadPOIMessage = (data) => {
        var self = this;
        self.poiAllInfo = data;

        if (LocalCache.get("_collect_")) {
            //已收藏
            if (LocalCache.get("_collect_").hasOwnProperty(String(`${data.typeID}_${data.FID}`))) {
                self.setState({
                    isCollectMessage: true
                })
            } else {
                //未收藏--上传POI数据至接口--插入到本地缓存中
                self.setState({
                    isCollectMessage: false
                })
            }
        }
    }

    UNSAFE_componentWillMount() {
        this.setState({isShowLoading: true});
    }

    //更新位置点
    updateLocation = (data) => {
        var self = this;
        if (this.mapIsOk) {
            // 自动楼层切换
            if (data.floorId && parseInt(Number(data.floorId)) !== this._currentFloorId) {

                if (!self.isFloorChange || this._currentFloorId !== Number(data.floorId)) {
                    self.changeFloor(Number(data.floorId));
                }

                self._currentFloorId = parseInt(Number(data.floorId));

                this.map.moveTo({
                    x: data.coord[0], y: data.coord[1], groupID: parseInt(Number(data.floorId)), callback: function () {
                        //跳转中心点完成
                        console.log("setNaviListener的fmmap的moveTo", data)
                    }
                });

                if (!self._locationMarker) {
                    self._locationMarker = new fengmap.FMLocationMarker({
                        //x坐标值
                        x: data.coord[0],
                        //y坐标值
                        y: data.coord[1],
                        //图片地址
                        url: `${PublicUrl}/images/pointer.png`,
                        //楼层id
                        groupID: Number(data.floorId),
                        //图片尺寸
                        size: 30,
                        //marker标注高度
                        height: 3
                    })
                    self.map.addLocationMarker(this._locationMarker);
                } else {
                    self._locationMarker.setPosition({
                        x: data.coord[0],
                        y: data.coord[1],
                        time: 1.5,
                        groupID: Number(data.floorId)
                    });
                }
                self.isFloorChange = true;
            }

            if (self._locationMarker && self.isFloorChange && data.floorId) {
                self._locationMarker.moveTo({
                    x: data.coord[0],
                    y: data.coord[1],
                    time: 1.5,
                    groupID: Number(data.floorId)
                });
            }
        }
    }

    //地图出错显示
    onRefreshMap() {
        this.componentWillUnmount();
        this.setState({
            isMapError: false
        }, () => {
            this.componentDidMount();
            console.log("执行了");
        });
    }

    // 1.handleLocation 没有定位点，进行定位
    // 2.getChangeMapPosition 有定位点，开始进入跟随状态，移动过程中  设置成地图的中心
    // 3.getOtherChange 有定位点，同时改变定位点和地图方向
    getOtherChange = () => {
        this.setState({
            locationStatus: 1,
            walkChange: false
        });
    }

    //状态为2的情况下  地图和定位点的方向都会偏移
    getChangeMapPosition = () => {
        this.setState({
            locationStatus: 3,
            walkChange: true
        });
    }

    handleChangePosition = () => {
        var self = this;
        console.log('==> locationTimer', this._locationTimer);
        if (this._locationTimer) {
            notify.show(`${Lang.Positioning}`, 'warning');
            clearTimeout(this._locationTimer);
        } else {
            locateByBLE(function (data) {
                console.log("======点击定位之后返回的数据======", data);
                if (self._locationTimer) {
                    clearTimeout(self._locationTimer);
                    self._locationTimer = null;
                }

                if (self.map && data && data.coord.length === 2 && data.floorId && Number(data.floorId) !== Number.NaN) {
                    //切换室内
                    // if(data){
                    //     self.setState({
                    //         showMapInput: true
                    //     })
                    // }
                    // self.groupControl.changeFocusGroup(data.floorId, false);
                    // 点击按钮，当前显示楼层与定位楼层不一样时，设置中心点,切换楼层
                    if (self._viewCurrentFloorId !== parseInt(Number(data.floorId))) {
                        self.changeFloor(Number(data.floorId));
                        self.map.moveTo({
                            x: data.coord[0],
                            y: data.coord[1],
                            groupID: parseInt(Number(data.floorId)),
                            callback: function () {
                                //跳转中心点完成
                                console.log("locateByBLE-map.moveTo", data);
                            }
                        });
                    }
                    // self.updateLocation(data);
                    //标签是否存在
                    if (self._locationMarker) {
                        //移动locationMarker,直接移动不管平滑
                        self.changeFloor(Number(data.floorId));
                        self._locationMarker.setPosition({
                            x: data.coord[0],
                            y: data.coord[1],
                            groupID: Number(data.floorId)
                        });
                    } else {
                        //定位图标导航位置
                        self._locationMarker = new fengmap.FMLocationMarker({
                            //x坐标值
                            x: data.coord[0],
                            //y坐标值
                            y: data.coord[1],
                            //图片地址
                            url: `${PublicUrl}/images/pointer.png`,
                            //楼层id
                            groupID: Number(data.floorId),
                            //图片尺寸
                            size: 30,
                            //marker标注高度
                            height: 3
                        })
                        self.map.addLocationMarker(self._locationMarker);
                    }

                    notify.show(`${Lang.LocateSuccess}`, 'success');
                }
            });
        }
        this._locationTimer = setTimeout(function () {
            console.log("重新初始化藍牙");
            // 取消定位回调方法
            cancelBLELocation();
            // 一定时间没有返回数据则重新初始化微信蓝牙
            // 主要目的是检测蓝牙开关是否被关闭了等情况
            initialWechatBLE(self.handleWechatBLE);
            notify.show(`${Lang.NaviFailed}`, 'error');
            self._locationTimer = null;
        }, 15000);
    }

    // 点击定位按钮
    handleLocation = () => {
        var self = this;
        //地图加载完成才能点击
        if (this.mapIsOk) {
            console.log("点击定位按钮");
            //有定位点状态 处于跟随状态
            if (self._currentCootd) {
                console.log("===> 77777777777777777", self);
                if (self._currentFloorId !== self._viewCurrentFloorId) { //切换的楼层 和 定点楼层编号不一样的时候 执行此操作 切换地图和更改楼层文字

                    self.changeFloor(Number(self._currentFloorId));

                    self.map.moveTo({
                        x: self._currentCootd[0],
                        y: self._currentCootd[1],
                        groupID: Number(self._currentFloorId)
                    });

                } else {
                    if (self._locationMarker) {
                        self._locationMarker.setPosition({
                            x: self._currentCootd[0],
                            y: self._currentCootd[1],
                            groupID: Number(self._currentFloorId)
                        });
                    }
                    self.setState({
                        locationStatus: 2
                    });
                }

                if (self.state.locationStatus === 1) {
                    self.handleChangePosition();
                }
            } else {
                console.log("重新定位");
                self.handleChangePosition();
            }
        } else {
            notify.show(`${Lang.MapNotLoad}`, 'error ');
        }
    }

    locationShare() {
        var self = this;
        //当前坐标点 x y 楼层编号
        //未定位时，给提示信息
        if (self._currentCootd && self._currentCootd[0] && self._currentCootd[1]) {
            //处理分享位置的坐标点在国展范围之内
            var vertx = [13502584.4887, 13501945.8831, 13502916.2917, 13503612.1975];
            var verty = [3657022.4932, 3658047.6366, 3658536.7518, 3657204.5625];
            var isNear = pnpoly(4, vertx, verty, self._currentCootd[0], self._currentCootd[1]);
            //处理分享位置的坐标点在国展范围之内

            if (self._currentCootd && isNear) {
                var KeyEnCode = KEncode(self._currentCootd[0], self._currentCootd[1], self._currentFloorId);

                var currentX = self._currentCootd[0];
                var currentY = self._currentCootd[1];
                var currentGroup = self._currentFloorId;

                //请求参数
                var paramsObj = {
                    sharetype: 1,
                    sharemode: 1,
                    unid: LocalCache.get("openID"),
                    kcode: KeyEnCode,
                    currentX: currentX,
                    currentY: currentY,
                    groupid: self._currentFloorId,
                    sharecontent: "",
                    venuename: "国家会展中心(上海)",
                    venueuuid: MapId,
                    appcode: AppCode,
                    apptype: AppType
                }
                saveUserShareInfo(paramsObj).then((res) => {
                    console.error('分享', res);
                })
                //传入当前的楼层name
                var floorName = getNameByGroupID(self._currentFloorId);

                //跳转小程序时将src的路径进行加密
                wx.miniProgram.getEnv(function (res) {
                    if (res.miniprogram === true) {
                        wx.miniProgram.navigateTo({
                            url: `/pages/share/index?shareKeyEnCode=${KeyEnCode}&floorName=${floorName}&currentX=${currentX}&currentY=${currentY}&currentGroup=${currentGroup}`,
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
            } else {
                notify.show(`${Lang.MoveNecc}`, 'warning')
            }
        } else {
            notify.show(`${Lang.MoveNecc}`, 'warning')
        }
    }

    // 关闭弹框pop
    cancelRoutePlan = () => {
        // alert(11666666666);
        var self = this;
        self.moveFlagTouch(true); // 开启滑动面板滑动
        this._navi.clearAll();
        if (self.imgMarkerLayer) {
            self.imgMarkerLayer.removeAll();
        }

        if (self.selectedModel) {
            self.selectedModel.selected = false;
        }

        self.setState({
            showRoutePopup: false,
            destination: null,
            showStartNav: false,
            isShowThisInput: true,
            showMapInput: true,
            showCardD: 'block'
        });
        self.onAddHistory();
        console.log(9999999999,self)
        // self.child.searchHistory();

    }

    collectList = () => {
        if (LocalCache.get('userInfo') == undefined || LocalCache.get('userInfo') == '') {
            this.props.history.push({pathname: 'login'})
        } else {
            this.props.history.push({pathname: 'search', state: {allButton: this.state.permisionList}});
        }

    }

    navigateHotSearch = () => {
        wx.miniProgram.getEnv(function (res) {
            if (res.miniprogram === true) {
                wx.miniProgram.navigateTo({
                    url: `/pages/hot/index`,
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


    changeFloor = (gid, ignoreValue = false) => {

        //直接获取到地图到楼层切换成gid到参数
        this.groupControl.changeFocusGroup(gid, false);

        if (this.state.locationStatus === 1) {
            this.setState({
                walkChange: false
            })
        }

        if (this.floorEl) {
            this.floorEl.updateFloorText(gid);
        }
    }

    isClick = () => {
        var self = this;
        if (this.state.isCollectMessage) {
            // console.log("已收藏");
            self.cancleCurrentCollect(self.poiAllInfo);
            //删除当前POI数据
        } else {
            //添加当前POI数据
            self.addCurrentCollect(self.poiAllInfo);
        }

        this.setState(prevState => ({
            isCollectMessage: !prevState.isCollectMessage
        }));
    }

    //取消收藏
    cancleCurrentCollect = (data) => {
        console.log("取消收藏界面");
        var paramsObj = {
            unid: LocalCache.get("userInfo").userUuid,
            fid: data.FID,
            venueuuid: MapId,
            appcode: AppCode,
            apptype: AppType
        }
        qwest.post("/manage/api/appclient/wxusercollections/cancelUserCollection", paramsObj)
            .then(function (xhr, res) {
                if (res.code == 0) {
                    LocalCache.get("_collect_")[`${data.typeID}_${data.fid}`] = null;
                    initialCollectList();
                }
            }).catch(function (e, xhr, res) {
            console.error(e);
            console.error(res);
        }).complete(function () {
        })

    }

    //添加收藏
    addCurrentCollect = (data) => {
        var currentXPosition = this._currentCootd === null ? null : this._currentCootd[0];
        var currentYPosition = this._currentCootd === null ? null : this._currentCootd[1];
        var paramsObj = {
            unid: LocalCache.get("userInfo").userUuid,
            fid: data.FID,
            name: data.name,
            ename: data.ename,
            typeid: data.typeID,
            centerX: data.mapCoord.x,
            centerY: data.mapCoord.y,
            centerZ: data.mapCoord.z,
            clienttype: "1",
            currentX: currentXPosition,
            currentY: currentYPosition,
            currentZ: 0,
            groupid: data.groupID,
            groupname: getNameByGroupID(data.groupID),
            venueuuid: MapId,
            venuename: MapOptions.fmapAppName
        }
        qwest.post("/manage/api/appclient/wxusercollections/saveNewCollections", paramsObj)
            .then(function (xhr, res) {
                console.log('添加收藏22：', res);
                let self = this;
                if (res.code == 0) {
                    initialCollectList();

                    LocalCache.get("_collect_")[`${data.typeID}_${data.fid}`] = {
                        unid: LocalCache.get("openID"),
                        // unid: "oM5F45CR5nKMIzRZhVkktJCZtZrw",
                        fid: data.FID,
                        name: data.name,
                        ename: data.ename,
                        typeid: data.typeID,
                        centerX: data.mapCoord.x,
                        centerY: data.mapCoord.y,
                        centerZ: data.mapCoord.z,
                        clienttype: "1",
                        currentX: self._currentCootd[0],
                        currentY: self._currentCootd[1],
                        currentZ: 0,
                        groupid: data.groupID,
                        groupname: getNameByGroupID(data.groupID),
                        venueuuid: MapId,
                        venuename: MapOptions.fmapAppName
                    }

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

    handleClickVoice = () => {
        // this.props.history.push({pathname: 'history_search', state: {list: this.state.permisionList}});

    }

    async sharePoiMessage() {
        var paramsObj = {
            sharetype: 2,
            sharemode: 1,
            unid: LocalCache.get("openID")
        }
        saveUserShareInfo(paramsObj).then((res) => {
            console.log(res);
        })
    }

    shagePoiNavigate = () => {
        var self = this;
        console.log('self=======', self)
        var data = self.poiAllInfo;
        console.log('点击位置分享======', data)
        if (data) {
            self.setState({
                showMapMarquee: false
            })
            //传入当前的楼层name
            var floorName = getNameByGroupID(data.groupID);
            var KeyEnCode = KEncode(data.mapCoord.x, data.mapCoord.y, data.groupID);
            // console.log(KeyEnCode);
            //传入name
            var PoiName = data.name === null ? "" : data.name.replace("%rn%", "").replace("%rn%", "").replace("%rn%", "");
            var PoiEname = data.ename === null ? "" : data.ename.replace("%rn%", "").replace("%rn%", "").replace("%rn%", "");
            var PoigroupID = data.groupID;
            var PoiCoorX = data.mapCoord.x;
            var PoiCoorY = data.mapCoord.y;
            var PoiFid = data.FID;

            wx.miniProgram.getEnv(function (res) {
                console.log('位置分享res', res)
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
            })
        }

    }


    //点击去哪儿
    //显示路线详情 和 开启导航  --- 只是进行路线的规划  画线
    //点击开始导航的时候才进行开始导航
    confirmRoutePlan = () => {
        // alert(9999999999)
        var self = this;
        self.setState({
            showCardD: 'none'
        })

        if (this._currentCootd) {
            this.setState({
                showRouteLoading: true,
                showCardD: 'none'
            })

            setTimeout(function () {
                //添加起点  绘制导航线
                self._navi.setStartPoint({
                    x: self._currentCootd[0],
                    y: self._currentCootd[1],
                    groupID: self._currentFloorId,
                    url: `${PublicUrl}/images/start.png`,
                    size: 32,
                }, false);

                if (getUrlParams('shareType') && self.state.initShareGoThere) {
                    //此处判断如果是通过小程序分享过来的直接设置成终点
                    self._navi.setEndPoint({
                        url: `${PublicUrl}/images/end.png`,
                        width: 30,
                        size: 30,
                        x: self.mapCoordXInfo,
                        y: self.mapCoordYInfo,
                        groupID: Number(self.floorIDInfo)
                    }, false);

                    //路网数据
                    const line = self._navi.drawNaviLine();
                    let lineStyle = {
                        //设置线的宽度
                        lineWidth: 6,
                        //设置线的透明度
                        alpha: 0.8,
                        //设置线的类型为导航线
                        lineType: fengmap.FMLineType.FMARROW,
                        //设置线动画,false为动画
                        noAnimate: false,
                        smooth: true
                    };
                    console.error("11111111111111111111");
                    self._navi.clearNaviLine();
                    self.map.drawLineMark(line, lineStyle);

                    if (line) {
                        //获取地图开始导航前地图缩放比例
                        self.startNaviScaleLevel = self.map.mapScaleLevel;

                        var result = getRouteDetailLine(self._navi);

                        console.log(result);

                        let distance = precise(self._navi.naviDistance, 1);

                        if (result && result.length > 0) {
                            self.setState({
                                naviList: result,
                                showRouteLoading: false,
                                showStartNav: true,
                                naviDistance: distance,
                                naviTime: Math.ceil(distance / 80) // 普通人每分钟走80米
                            })
                        }
                    } else {
                        notify.show(`${Lang.NaviCurrentDes}`, 'warning');
                        self.setState({
                            showRoutePopup: false
                        });
                    }

                } else {
                    //路网数据
                    const line = self._navi.drawNaviLine();

                    if (line) {
                        //获取地图开始导航前地图缩放比例
                        self.startNaviScaleLevel = self.map.mapScaleLevel;

                        var resultCurrent = getRouteDetailLine(self._navi);

                        console.log(resultCurrent);

                        let distance = precise(self._navi.naviDistance, 1);

                        console.log(self._navi);

                        if (resultCurrent && resultCurrent.length > 0) {
                            self.setState({
                                naviList: resultCurrent,
                                showRouteLoading: false,
                                showStartNav: true,
                                naviDistance: distance,
                                naviTime: Math.ceil(distance / 80) // 普通人每分钟走80米
                            })
                        }
                    } else {
                        notify.show(`${Lang.NaviCurrentDes}`, 'warning');
                        self.setState({
                            showRoutePopup: false
                        });
                    }
                }
            }, 100);
        } else {
            notify.show(`${Lang.MoveNecc}`, 'warning');
        }
    }


    showRoutePage = () => {
        this.setState({
            showRouteComponent: true
        })
    }

    cancelNavigation = () => {
        this.setState({
            showNaviPopup: false,
            destination: null,
            showMapInput: true,
            isShowThisInput: true,
            showTopNaviPopup: false,
            showRouteStartPopup: false
        });
        //设置成未导航
        this.naviSwitch = false;
        //清除所有导航数据
        this._navi.clearAll();
        //楼层控件,是否允许展开控件操作
        this.groupControl.enableExpand = true;
        //还原导航前地图缩放比例
        this.map.mapScaleLevel = this.startNaviScaleLevel;

        this.startNaviScaleLevel = null;

        notify.show(`${Lang.NaviDestination}`, 'success');

    }

    setLocationMakerPosition = (coord, angle) => {
        var self = this;
        if (coord && self.naviSwitch === true) {
            //设置定位图标旋转角度
            // if (angle) {
            //     //定位点方向始终与路径线保持平行
            //     self._locationMarker.rotateTo({
            //         to: -angle,
            //         duration: 0
            //     });
            //     //第一人称需旋转地图角度
            //     self.map.rotateTo({
            //         to: angle,
            //         time: 0.5
            //     });
            // }
            //不同楼层
            var currentGid = self.map.focusGroupID;
            // if (currentGid !== coord.groupID) {
            if (currentGid !== self._locationMarker.groupID) {
                //重新设置聚焦楼层
                self.groupControl.changeFocusGroup(coord.groupID, false);
                //设置locationMarker的位置
                self._locationMarker.setPosition({
                    //设置定位点的x坐标
                    x: coord.x,
                    //设置定位点的y坐标
                    y: coord.y,
                    //设置定位点所在楼层
                    groupID: coord.groupID
                });
            }

            //移动locationMarker
            self._locationMarker.moveTo({
                //设置定位点的x坐标
                x: coord.x,
                //设置定位点的y坐标
                y: coord.y,
                //设置定位点所在楼层
                groupID: coord.groupID,
                time: 1.5
            });
            //移动地图
            self.map.moveTo({
                x: coord.x,
                y: coord.y,
                groupID: coord.groupID,
                time: 0.5
            });
        }
    }

    walkingNavi = () => {
        var self = this;
        self._navi.on('walking', function (data) {

            self.setState({
                showTopNaviPopup: true
            });

            var dist = (data.remain).toFixed(1);
            //普通人每分钟走80米。
            var time = precise(dist / 80);

            var minutes = Math.ceil(time);

            var prompt = self._navi.naviDescriptions[data.index];

            var naviDirection = self._navi.naviDescriptionsData[data.index];

            console.log(naviDirection);

            //更新地图旋转角度
            self.setLocationMakerPosition(data.point, data.angle);

            //在当前偏移最大偏移距离之间，重新计算路径
            if (data.distance > NaviOptions.maxOffsetDis) {
                // alert(data.distance + '=================路径偏移，重新规划路线==============' + NaviOptions.maxEndDistance);
                // self.resetNaviRoute(data.point);
                if (self._navi) {
                    //更新起点坐标
                    self._navi.setStartPoint({
                        x: self._currentCootd[0],
                        y: self._currentCootd[1],
                        groupID: Number(self._currentFloorId),
                        url: `${PublicUrl}/images/start.png`,
                        size: 32
                    }, false);
                    //画路径线
                    self._navi.drawNaviLine();

                    var newDist = (data.remain).toFixed(1);

                    var newTime = precise(dist / 80);

                    var newMinutes = parseInt(newTime);

                    var newPrompt = self._navi.naviDescriptions[data.index];

                    var newNaviDirection = self._navi.naviDescriptionsData[data.index];

                    //更新地图旋转角度
                    self.setLocationMakerPosition(data.point, data.angle);

                    self.setState({
                        showRouteStartPopup: true,
                        showTopText: newPrompt,
                        naviStartDistance: newDist,
                        naviStartTime: newMinutes,
                        naviPositionDirection: newNaviDirection.endDirection
                    })
                }
            }

            //当剩余距离小于设置的距离终点的最小距离时，自动结束导航
            if (data.remain < NaviOptions.maxEndDistance || data.remain === 0) {
                //取消导航
                self.cancelNavigation();
            } else {
                self.setState({
                    showTopText: prompt,
                    showRouteStartPopup: true,
                    naviStartDistance: dist,
                    naviStartTime: minutes,
                    naviPositionDirection: naviDirection.endDirection
                })
            }
        });
    }

    startRoute = () => {
        console.log("开始导航");
        this.naviSwitch = true;
        var self = this;
        //放大导航地图
        self.map.mapScaleLevel = NaviOptions.naviScaleLevel;

        if (self.selectedModel) {
            self.selectedModel.selected = false;
        }

        this.walkingNavi();

        this.setState({
            showRoutePopup: false,
            showRouteComponent: false,
            showMapInput: false,
            isShowThisInput: false,
            showMapMarquee: false
        })

    }

    //在历史搜索界面获取从缓存中到poi信息  在这一次将查询的信息添加到缓存中
    willToPosition = (event, item) => {
        var self = this;
        self.setState({
            showRouteStyle: true,
            showRoutePopup: true,
            bottomShow: false,
            destination: item
        });

        self.poiAllInfo = item.target;

        if (LocalCache.get("_collect_")) {
            //已收藏
            if (LocalCache.get("_collect_").hasOwnProperty(String(`${item.typeID}_${item.FID}`))) {
                self.setState({
                    isCollectMessage: true
                })
            } else {
                self.setState({
                    isCollectMessage: false
                })
            }
        }


        var currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

        var SearchPOIcurrentX = self._currentCootd === null ? null : this._currentCootd[0];
        var SearchPOIcurrentY = self._currentCootd === null ? null : this._currentCootd[1];

        SearchHistory(item, currentTime, SearchPOIcurrentX, SearchPOIcurrentY);
    }

    clearChangeStatue = () => {
        console.log("清空了");
        var self = this;
        self.setState({
            isShowSearchPopup: false
        })
    }

    showMapPop = () => {
        // console.log("显示地图");
        this.setState({
            showRouteComponent: false
        })
    }


    //开始导航时
    startRouteNav = () => {
        // console.log("开始导航");
        var self = this;
        this.naviSwitch = true;
        if (self.selectedModel) {
            self.selectedModel.selected = false;
        }
        this.setState({
            showRoutePopup: false,
            showRouteComponent: false,
            showRouteStartPopup: true,
            showMapInput: false,
            showTopNaviPopup: true
        })
    }

    exitNav = () => {
        // console.log("退出导航");
        var self = this;
        self._navi.clearAll();
        self.naviSwitch = false;
        if (self.selectedModel) {
            self.selectedModel.selected = false;
        }
        this.setState({
            showRouteStartPopup: false,
            showMapInput: true,
            isShowThisInput: true,
            showTopNaviPopup: false,
            showCardD: "block",
            showMapMarquee: true
        })
    }

    showAllRoute = () => {
        // console.log("查看全览");
        this.setState({
            showRouteComponent: true
        })
    }

    clearInput = () => {
        // console.log("清楚文本框事件");
        var self = this;
        if (self._navi) {
            self._navi.clearAll();
        }
        if (self._currentCootd) {
            self.map.moveTo({
                x: self._currentCootd[0],
                y: self._currentCootd[1],
                groupID: Number(self._currentFloorId)
            });
        }
        this.setState({
            searchValue: "",
            isShowSearchPopup: false,
            showModalPopup: false,
            bottomShow: false
        })
        document.activeElement.blur();
        self.moveFlagTouch(true); // 开启滑动面板
    }

    //点击前往
    getToModalPopup = (data) => {
        var self = this;
        console.log("点击了前往", data);
        if (data.name) {
            self.setState({
                showModalPopup: false,
                showRoutePopup: true,
                destination: {
                    name: data.name,
                    ename: data.ename,
                    place: {
                        x: data.mapCoord.x,
                        y: data.mapCoord.y,
                        groupID: Number(data.groupID)
                    },
                    groupID: Number(data.groupID)
                }
            })

            //上终点marker 画线
            self._navi.setEndPoint({
                url: `${PublicUrl}/images/end.png`,
                width: 30,
                size: 30,
                x: data.mapCoord.x,
                y: data.mapCoord.y,
                groupID: Number(data.groupID)
            }, false);

            self.changeFloor(Number(data.groupID));
        } else {
            self.setState({
                showModalPopup: false,
                showRoutePopup: true,
                destination: {
                    name: null,
                    ename: null,
                    place: {
                        x: Number(data.coor_x),
                        y: Number(data.coor_y),
                        groupID: Number(data.floor_id)
                    },
                    groupID: Number(data.floor_id)
                }
            })
        }
        self.confirmRoutePlan();
    }

    /**
     * 处理复制的 Key 码
     * @param value
     */
    handleCopyKCode = (value) => {
        let self = this;
        console.log("处理复制的 K 码", value);
        var reg = /\d[0-9a-zA-Z]{6}/;
        var paramsPOi = LocalCache.get("poi_message")[value.toString()];
        //字符长度为7 && 使用正则表达式进行匹配 才能弹框
        if (value.length === 7 && reg.test(value) && paramsPOi) {
            document.activeElement.blur();
            this.setState({
                showModalPopup: true,
                searchValue: value
            })

            // var paramsPOi = LocalCache.get("poi_message")[value.toString()];
            console.log('paramsPOi3333', paramsPOi);
            //如果查询出来列表中有这个fid就是poi
            if (paramsPOi) {
                var searchAnalyserFID = new fengmap.FMSearchAnalyser(self.map);
                var searchReqFiD = new fengmap.FMSearchRequest();
                searchReqFiD.FID = paramsPOi.fid;

                searchAnalyserFID.query(searchReqFiD, function (result) {
                    //result 为查询到的结果集。
                    console.log(result);
                    self.setState({
                        getModalMessage: result[0]
                    })
                });
            } else {
                //实时位置 直接解码 获取x y  groupid
                var enCode = KDecoder(value);
                console.log('实时位置====', enCode)
                self.setState({
                    getModalMessage: enCode
                })
            }
        }
    }

    changeInput = (e) => {
        var self = this;
        // self.state.searchValue = e.currentTarget.value; // 设置中间变量保存input输入值，防止被自动清空
        self.state.searchValue = e.currentTarget.value;
        self.handleCopyKCode(e.currentTarget.value);
    }

    //拖动切换图标 以及相应的事件
    handleDrag = () => {
        this.setState({
            walkChange: true
        })
    }

    aboutAs = () => {
        wx.miniProgram.getEnv(function (res) {
            if (res.miniprogram === true) {
                wx.miniProgram.navigateTo({
                    url: `/pages/about/index`,
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

    // 点击伸缩面板下拉图标
    onPullHalf = () => {
        console.log('onPullHalf');
        let self = this;
        var logoDao = document.getElementById('logoDao');
        var slideBoard = document.getElementById('slideBoard');
        self.state.slideBoardHeight = parseInt(slideBoard.style.height);
        if (slideBoard) {
            slideBoard.style.top = '75%';
            slideBoard.style.height = '25%';
            curSlideBoardHeight = $(window).height() * 0.25;
        }
        self.setState({
            panelArrawDirectionB: "INIT"
        })

        if (logoDao) {
            logoDao.style.top = "70%"
        }

        if (self._navi) {
            self._navi.clearAll();
        }
        if (self._currentCootd) {
            self.map.moveTo({
                x: self._currentCootd[0],
                y: self._currentCootd[1],
                groupID: Number(self._currentFloorId)
            });
        }
        self.setState({
            searchValue: "",
            isShowSearchPopup: false,
            showModalPopup: false,
            bottomShow: false
        })
        document.activeElement.blur();
        self.moveFlagTouch(true);

    }
    onPullAll = (e) => {
        console.log('onPullAll', e.touches)
        let self = this;
        var logoDao = document.getElementById('logoDao');
        var slideBoard = document.getElementById('slideBoard');
        if (slideBoard) {
            slideBoard.style.top = '45%';
            slideBoard.style.height = '55%';
            curSlideBoardHeight = $(window).height() * 0.55;
        }
        self.setState({
            panelArrawDirectionB: "HALF"
        })

        if (logoDao) {
            logoDao.style.top = "40%"
        }
    }

    onPullInit = (e) => {
        console.log('onPullInit');
        let self = this;
        var logoDao = document.getElementById('logoDao');
        var slideBoard = document.getElementById('slideBoard');
        if (slideBoard) {
            slideBoard.style.top = '45%';
            slideBoard.style.height = '55%';
            curSlideBoardHeight = $(window).height() * 0.55;
        }
        self.setState({
            panelArrawDirectionB: "HALF"
        })

        if (logoDao) {
            logoDao.style.top = "40%"
        }
    }

    // 臨時測試
    receiveBeaconData = () => {
        console.log("receive once beacon data ...");
        let self = this;
        enterLocationAlgo();
    }

    onRef = (ref) => {
        this.child = ref;
    }
    onRef2 = (ref) => {
        this.child2 = ref;
    }
    clickMessageDetail = () => {
        // this.child.getNotifyDetail();
        this.props.history.push({pathname: '/marqueelist'});
    }
    clickMine = () => {
        if (LocalCache.get('userInfo') == undefined || LocalCache.get('userInfo') == '') {
            this.props.history.push({pathname: 'login'})
        } else {
            this.props.history.push({pathname: 'mine'});
        }

    }
    // 点击位置共享
    PositionShare = () => {
        var self = this;
        //aaaaaaaaaaaaa H5端测试
        // var poiData = {
        //     groupid: 2,
        //     x: 13502771.760876795,
        //     y: 3657370.4721014188,
        //     z: 0.20000000298023224
        // }
        // LocalCache.set('poi_positonshare', poiData);
        // let INQUERY_QUESTION_TYPE = "LAST_CAN_USE_ROOM_INFO";
        // let roomId = null;
        // queryRoomInfo(roomId, INQUERY_QUESTION_TYPE, function (res) {
        //     console.log('点击位置共享查询返回===666666', res);
        //     if (res.code == 0 && res.data.roomId) {
        //         self.props.history.push({pathname: '/currentroom', state: {joinEd: res.data}});
        //     } else {
        //         self.props.history.push({pathname: '/PositionShare'});
        //     }
        // });
        // return
        //aaaaaaaaaaaaaa
        //当前坐标点 x y 楼层编号
        //未定位时，给提示信息
        if (self._currentCootd && self._currentCootd[0] && self._currentCootd[1]) {
            //处理分享位置的坐标点在国展范围之内
            var vertx = [13502584.4887, 13501945.8831, 13502916.2917, 13503612.1975];
            var verty = [3657022.4932, 3658047.6366, 3658536.7518, 3657204.5625];
            var isNear = pnpoly(4, vertx, verty, self._currentCootd[0], self._currentCootd[1]);
            //处理分享位置的坐标点在国展范围之内

            if (self._currentCootd && isNear) {
                var KeyEnCode = KEncode(self._currentCootd[0], self._currentCootd[1], self._currentFloorId);
                var currentX = self._currentCootd[0];
                var currentY = self._currentCootd[1];
                var currentGroup = self._currentFloorId;
                var poiData2 = {
                    x: currentX,
                    y: currentY,
                    z: 0,
                    groupid: currentGroup
                }
                console.error(6666666666666, poiData2);
                LocalCache.set('poi_positonshare', poiData2);

                if (LocalCache.get('userInfo') == undefined || LocalCache.get('userInfo') == '') {
                    this.props.history.push({pathname: 'login'});

                } else {
                    self.state.mapClickFlag = false; // 进入位置共享禁止点击地图

                    let INQUERY_QUESTION_TYPE = "LAST_CAN_USE_ROOM_INFO";
                    let roomId = null;
                    queryRoomInfo(roomId, INQUERY_QUESTION_TYPE, function (res) {
                        console.error(res);
                        console.error('点击位置共享查询返回===666666', res);
                        if (res.code == 0 && res.data.roomId) {
                            self.props.history.push({pathname: '/currentroom', state: {joinEd: res.data}});
                        } else {
                            self.props.history.push({pathname: '/PositionShare'});
                        }
                    });
                }


            } else {
                notify.show(`${Lang.MoveNecc}`, 'warning')
            }
        } else {
            notify.show(`${Lang.MoveNecc}`, 'warning')
        }

        console.log('位置共享===', self.state.mapClickFlag, this)

    }

    // 最小化房间
    goCurrentRoom = () => {
        // self.state.mapClickFlag = false; // 进入位置共享禁止点击地图
        this.setState({
            mask_show: false,
            creat_show: false,
            showCard: true,
            showCardD: 'block',
            showMapMarquee: true,
            showMapInput: true,
            mapClickFlag: true
        });
    }

    // 关闭退出房间按钮 old
    // offMask = () => {
    //
    //     let self = this;
    //     // let roomId = document.getElementById('roomId').value;
    //     exitRoom(function (res) {
    //         console.error('退出房间==========res', res);
    //         if (res.code == 0 && res.extraData == 'EXIT_ROOM') {
    //             self.setState({
    //                 mask_show: false,
    //                 creat_show: false,
    //                 mapClickFlag: true,
    //                 showCard: true,
    //                 showCardD: 'block',
    //                 showMapMarquee: true,
    //                 showMapInput: true,
    //             });
    //             // var timer1 = LocalCache.get('timer1');
    //             // var timer2 = LocalCache.get('timer2');
    //             // var timer3 = LocalCache.get('timer3');
    //             // clearInterval(timer1);
    //             // clearInterval(timer2);
    //             // clearInterval(timer3);
    //             layer.removeAll(); // 清除marker
    //             clearInterval(timerInter);
    //
    //         }
    //     });
    //
    // }

    hideDialog = () => {
        this.setState({
            showZh: false,
            showEn: false,
            showToastVoiceFail: false
        });
    }

    offMask = () => {
        let self = this;
        var paramsObj = {
            unid: LocalCache.get("userInfo").userUuid,
            venueuuid: MapId,
            appcode: AppCode,
            apptype: AppType,
            roomId: self.state.roomId
        }
        qwest.post("/manage/api/appclient/realTimeShareLocation/exitRoomInShareLocation", paramsObj)
            .then(function (xhr, res) {
                if (res.code == 0) {
                    console.error('成功退出12366');
                    self.setState({
                        mask_show: false,
                        creat_show: false,
                        mapClickFlag: true,
                        showCard: true,
                        showCardD: 'block',
                        showMapMarquee: true,
                        showMapInput: true,
                    });
                }

            })
            .catch(function (e, xhr, res) {
                // Process the error
                console.error(e);
                console.error(res);
            })
            .complete(function () {
                // console.error("  ======  complete ======= ");
            })
    }

    copyText = (text) => {
        // console.log(696969,text);
        // 数字没有 .length 不能执行selectText 需要转化成字符串
        const textString = text.toString();
        let input = document.querySelector('#copy-input');
        if (!input) {
            input = document.createElement('input');
            input.id = "copy-input";
            input.readOnly = "readOnly";        // 防止ios聚焦触发键盘事件
            input.style.position = "absolute";
            input.style.left = "-1000px";
            input.style.zIndex = "-1000";
            // input.style.bottom = "-1000px";
            // input.style.opacity = "0";
            document.body.appendChild(input)
        }

        input.value = textString;
        // ios必须先选中文字且不支持 input.select();
        selectText(input, 0, textString.length);
        if (document.execCommand('copy')) {
            document.execCommand('copy');
            notify.show("复制成功", 'success');
        } else {
            console.log('不兼容');
        }
        input.blur();

        // input自带的select()方法在苹果端无法进行选择，所以需要自己去写一个类似的方法
        // 选择文本。createTextRange(setSelectionRange)是input方法
        function selectText(textbox, startIndex, stopIndex) {
            if (textbox.createTextRange) {//ie
                const range = textbox.createTextRange();
                range.collapse(true);
                range.moveStart('character', startIndex);//起始光标
                range.moveEnd('character', stopIndex - startIndex);//结束光标
                range.select();//不兼容苹果
            } else {//firefox/chrome
                textbox.setSelectionRange(startIndex, stopIndex);
                textbox.focus();
            }
        }
    };

    copyText2 = (text) => {
        // console.log(696969,text);
        // 数字没有 .length 不能执行selectText 需要转化成字符串
        const textString = text.toString();
        let input = document.querySelector('#copy-input');
        if (!input) {
            input = document.createElement('input');
            input.id = "copy-input";
            input.readOnly = "readOnly";        // 防止ios聚焦触发键盘事件
            input.style.position = "absolute";
            input.style.left = "-1000px";
            input.style.zIndex = "-1000";
            // input.style.bottom = "-1000px";
            document.body.appendChild(input)
        }

        input.value = textString;
        // ios必须先选中文字且不支持 input.select();
        selectText(input, 0, textString.length);
        if (document.execCommand('copy')) {
            document.execCommand('copy');
            notify.show("复制成功", 'success');
        } else {
            console.log('不兼容');
        }
        input.blur();

        // input自带的select()方法在苹果端无法进行选择，所以需要自己去写一个类似的方法
        // 选择文本。createTextRange(setSelectionRange)是input方法
        function selectText(textbox, startIndex, stopIndex) {
            if (textbox.createTextRange) {//ie
                const range = textbox.createTextRange();
                range.collapse(true);
                range.moveStart('character', startIndex);//起始光标
                range.moveEnd('character', stopIndex - startIndex);//结束光标
                range.select();//不兼容苹果
            } else {//firefox/chrome
                textbox.setSelectionRange(startIndex, stopIndex);
                textbox.focus();
            }
        }
    };

    // 复制 参考文档 https://www.cnblogs.com/xixinhua/p/10823449.html
    copyArticle = () => {
        const range = document.createRange();
        // range.selectNode(document.querySelector(".copytxt"));
        range.selectNode(document.getElementById('text'));

        const selection = window.getSelection();
        if (selection.rangeCount > 0) selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('Copy');
        notify.show("复制成功", 'success');
    }

    copyArticle2 = () => {
        const range = document.createRange();
        // range.selectNode(document.querySelector(".copytxt"));
        range.selectNode(document.getElementById('text2'));

        const selection = window.getSelection();
        if (selection.rangeCount > 0) selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('Copy');
        notify.show("复制成功", 'success');
    }

    onTouchStart = () => {
        this.setState({
            showToastVoice: true,
        })
    }
    onTouchEnd = () => {
        this.setState({
            showToastVoice: false,
        })
    }
    onVoice = () => {
        this.setState({
            showZh: true,
            showEn: true
        })
    }
    resizeHeight = () => {
        let self = this;
        curSlideBoardHeight = $(window).height() * 0.95;
        self.setState({
            panelArrawDirectionB: "ALL"
        })
    }

    clickAR = () => {
        notify.show(`${Lang.messageAR}`, 'warning');
    }

    // 百度中文
    onDownZh = () => {
        const that = this;
        that.onTouchStart();
        wx.startRecord({
            success: function (res) {
                console.error('startRecord success');
                console.error('百度中文录音：', res);

            },
            fail: function (res) {
                console.error('startRecord fail zh');
                console.error(res);
                // alert("初始化未完成或没有权限");
            }
        })

    }

    onUpZh = () => {
        const that = this;
        let inputId = document.getElementById('inputId');
        that.onTouchEnd();
        $("#inputId").removeAttr("disabled");
        console.log(12123,inputId);
        // console.error('松开录音',that.props);
        wx.stopRecord({
            success: function (res) {
                console.error('stopRecord');
                console.error(res);
                // that.state.wxVoiceId = res.localId;
                wx.uploadVoice({
                    localId: res.localId, // 需要上传的音频的本地ID，由stopRecord接口获得
                    // isShowProgressTips: 1, // 默认为1，显示进度提示
                    success: function (tr) {
                        console.error(tr);
                        testParseVoiceId({"mediaId": tr.serverId, "lang": "cn"}).then(function (res) {
                            console.error(res);
                            that.hideDialog();
                            // alert(res.data);
                            // that.props.onSubmit(res.data); // 把语音识别结果传送给父组件的输入框中
                            //截取后面名词比较字段
                            let filterCNFrontWords = ["导航到", "导航去", "导航", "搜索", "查询", "查找", "要去", "搜", "查", "找", "去", "到", "要"];
                            //截取前面比较字段
                            let filterCNBackWords = ["在哪里", "在"];
                            let words = res.data;
                            let isContinue = true;
                            //截取后面文字
                            for (let i = 0; i < filterCNFrontWords.length; i++) {
                                let index = words.indexOf(filterCNFrontWords[i]);
                                if (index > -1) {
                                    words = words.substring((index + filterCNFrontWords[i].length), words.length);
                                    isContinue = false;
                                    break;
                                }
                            }
                            if (isContinue) {
                                //截取前面文字
                                for (let i = 0; i < filterCNBackWords.length; i++) {
                                    let index = words.indexOf(filterCNBackWords[i]);
                                    if (index > -1) {
                                        words = words.substring(0, index);
                                        isContinue = false;
                                        break;
                                    }
                                }
                            }
                            that.handleKeywordSearch(words);

                        });
                    },
                    fail: function (res) {
                        console.error('stopRecord fail');
                        console.error(res);
                        // alert(res);

                    }
                });
            },
            fail: function (res) {
                console.error('stopRecord fail zh22')
                console.error(res);
                // alert(res);
                that.setState({
                    showZh: false
                })
                notify.show("语音识别失败", "error");

            }
        })
    }

    // 英文
    onDownEn = () => {
        const that = this;
        that.onTouchStart();
        wx.startRecord({
            success: function (res) {
                console.error('startRecord success');
                console.error('百度英文录音：', res);
            },
            fail: function (res) {
                console.error('startRecord fail en');
                console.error(res);
                // alert("初始化未完成或没有权限");
            }
        })

    }

    onUpEn = () => {
        const that = this;
        that.onTouchEnd();
        wx.stopRecord({
            success: function (res) {
                console.error('stopRecord');
                console.error(res);
                // that.state.wxVoiceId = res.localId;
                wx.uploadVoice({
                    localId: res.localId, // 需要上传的音频的本地ID，由stopRecord接口获得
                    // isShowProgressTips: 1, // 默认为1，显示进度提示
                    success: function (tr) {
                        console.error(tr);
                        testParseVoiceId({"mediaId": tr.serverId, "lang": "en"}).then(function (res) {
                            console.error(res);
                            that.hideDialog();
                            // alert(res.data);
                            // that.props.onSubmit(res.data); // 把语音识别结果传送给父组件的输入框中
                            //英文，截取后面名词比较字段
                            let filterENFrontWords = ["go", "go to", "navigation", "search", "find", "where", "to", "two", "too"];
                            //英文，截取后面名词比较字段
                            let filterENBackWords = [];

                            let words = res.data;
                            let isContinue = true;
                            //截取后面文字
                            for (let i = 0; i < filterENFrontWords.length; i++) {
                                let index = words.indexOf(filterENFrontWords[i]);
                                if (index > -1) {
                                    words = words.substring((index + filterENFrontWords[i].length), words.length);
                                    isContinue = false;
                                    break;
                                }
                            }
                            if (isContinue) {
                                //截取前面文字
                                for (let i = 0; i < filterENBackWords.length; i++) {
                                    let index = words.indexOf(filterENBackWords[i]);
                                    if (index > -1) {
                                        words = words.substring(0, index);
                                        isContinue = false;
                                        break;
                                    }
                                }
                            }

                            that.handleKeywordSearch(words);

                            // that.handleKeywordSearch(res.data);

                        });
                    },
                    fail: function (res) {
                        console.error('stopRecord fail');
                        console.error(res);
                        // alert(res);
                    }
                });
            },
            fail: function (res) {
                console.error('stopRecord fail en22')
                console.error(res);
                // alert(res);
                that.setState({
                    showEn: false
                })
                notify.show("Speech recognition failure", "error");

            }
        })

    }


    render() {
        const {
            locationStatus,
            isMapError,
            isShowLoading,
            showLocateBtn,
            showMapInput,
            destination,
            showRoutePopup,
            groupIDs,
            isCollectMessage,
            permisionList,
            searchValue,
            showShare,
            isShowSearchPopup,
            searchList,
            bottomShow,
            showStartNav,
            showRouteLoading,
            showRouteStyle,
            showRouteComponent,
            naviList,
            showRouteStartPopup,
            naviDistance,
            naviTime,
            showTopNaviPopup,
            showTopText,
            showModalPopup,
            getModalMessage,
            naviStartDistance,
            naviStartTime,
            naviPositionDirection,
            isShowThisInput,
            showMapMarquee,
            mask_show,
            creat_show,
            roomId,
            showCard,
            showCardD,
            showToastVoice,
            showToastVoiceFail,
            panelArrawDirectionB
        } = this.state;
        let self = this;

        return (
            <React.Fragment>
                {isMapError
                    ? (<MapError onClick={this.onRefreshMap}/>)
                    : (
                        <div>
                            {/*地图*/}
                            <div id="map" className={style.container}/>

                            {/*首页顶部消息跑马灯滚动*/}
                            {showMapMarquee ?
                                <Marquee {...this.props} permisionList={permisionList} onRef={this.onRef}/> : null}

                            {/*定位按钮*/}
                            <LocateButton
                                getOtherChange={this.getOtherChange}
                                getChangeMapPosition={this.getChangeMapPosition}
                                walkChange={locationStatus}
                                visible={showLocateBtn}
                                onClick={this.handleLocation}
                                ref="LocateBut"
                            />

                            <SwitchFloor
                                ref={(el) => this.floorEl = el}
                                floors={groupIDs}
                                currentFloor={this._currentFloorId}
                                onChange={this.changeFloor}
                            />

                            <RoutePlanPopup
                                loading={showRouteLoading}
                                startRoute={this.startRoute}
                                RoutePosition={this.showRoutePage}
                                startNav={showStartNav}
                                sharePoiPosition={this.shagePoiNavigate}
                                showShare={showShare}
                                clickMessage={this.isClick}
                                isCollect={isCollectMessage}
                                visible={showRoutePopup}
                                data={destination}
                                onCancel={this.cancelRoutePlan}
                                onConfirm={this.confirmRoutePlan}
                                ref="sharePoiPosit"
                            />

                            {isShowSearchPopup ?
                                (<SearchPopup
                                    permisionList={permisionList}
                                    onClickPopup={this.onClickPopup}
                                    visible={bottomShow}
                                    searchList={searchList}
                                    OjectMessage={this.dataItem}
                                    showRouteStyle={showRouteStyle}
                                    willThereMessage={this.willToPosition}
                                    goCurrentHere={this.goCurrentHere}
                                />) : null}


                            <RouterDetailPage
                                visible={showRouteComponent}
                                naviDistance={naviDistance}
                                naviTime={naviTime}
                                naviSwitch={this.naviSwitch}
                                startRouteNav={this.startRouteNav}
                                naviList={naviList}
                                showMapPop={this.showMapPop}
                            />

                            <RouteToast
                                navishowDirection={naviPositionDirection}
                                visible={showTopNaviPopup}
                                showTopText={showTopText}
                            />

                            <RouteStartPopup
                                visible={showRouteStartPopup}
                                naviStartPopDistance={naviStartDistance}
                                naviStartPopTime={naviStartTime}
                                exitNav={this.exitNav}
                                allRouteList={this.showAllRoute}
                            />

                            <HomeModalPopup
                                getModalMessage={getModalMessage}
                                ModalPopup={showModalPopup}
                                getToModalPopup={this.getToModalPopup}
                            />

                            {/* 测试定位*/}
                            {/*<div style={{
                                width: 200,
                                height: 40,
                                position: 'absolute',
                                left: 20,
                                top: 100,
                                background: 'green',
                                color: 'white',
                                'text-align': 'center',
                                'line-height': 40,
                                'user-select': 'none',
                                '-webkit-user-select': 'none'
                            }} onClick={this.receiveBeaconData}>{"BEACONDATA"}</div>*/}

                            {/*logo 图标 热搜*/}
                            {showMapInput ? (
                                <div id="logoDao" className={style.logoDao} onClick={this.navigateHotSearch.bind(this)}>
                                    <img
                                        src={require('../../assets/image/n_login_dlz@2x.png')}
                                        style={{width: '100px', height: '18px'}}/></div>) : null}

                            {
                                Locale === "en" ?
                                    <Dialog type="ios" buttons={this.state.style2.buttons} show={this.state.showEn}>
                                        <button className={style.voiceDialog} onTouchStart={this.onDownEn}
                                                onTouchEnd={this.onUpEn}>
                                            <div className={style.voiceDialogImg}></div>
                                            <br/><br/>
                                            <span>{'Please press long to begin recording'}</span>
                                        </button>
                                    </Dialog> :
                                    <Dialog type="ios" buttons={this.state.style1.buttons} show={this.state.showZh}>
                                        <button className={style.voiceDialog} onTouchStart={this.onDownZh}
                                                onTouchEnd={this.onUpZh}>
                                            <div className={style.voiceDialogImg}></div>
                                            <br/><br/>
                                            <span>{'请长按开始录音输入'}</span>
                                        </button>
                                    </Dialog>
                            }


                            {/* 位置共享 创建房间蒙板 */}
                            {creat_show ? <div className={style.sharePopupFa}>
                                <div className={style.sharePopupItem}>
                                    <div className={style.shareLeft}>
                                        <div className={style.shareLeftTop}>
                                            <p><span className={style.shareLeftNum}>1</span>人</p>
                                            <p>进行位置共享</p>
                                        </div>
                                        <div className={style.shareLeftBottom}>
                                            <p>房间号</p>
                                            <div className={style.shareCopy}>
                                                <p id="text">{roomId}</p>
                                                {/*<span className={style.shareLeftCopy} onClick={() => this.copyText(roomId)}>复制</span>*/}
                                                <span className={style.shareLeftCopy}
                                                      onClick={this.copyArticle}>复制</span>
                                            </div>
                                            <textarea id="input" className={style.copyText}
                                                      onFocus={this.focusText}></textarea>
                                        </div>
                                    </div>
                                    <div className={style.shareRight}>
                                        <div>
                                            <p>{LocalCache.get('userInfo').nickname ? LocalCache.get('userInfo').nickname : LocalCache.get('userInfo').mobilePhone}&nbsp;
                                                <span>{`(楼层:  ${LocalCache.get('poi_positonshare').groupid - 1}F)`}</span>
                                            </p></div>
                                    </div>
                                    <div className={style.rightImg}>
                                        <div className={style.rightImgTop} onClick={this.offMask}>
                                            <img className={style.offImg}
                                                 src={require('../../assets/image/n_off@2x.png')} alt=""/>
                                        </div>
                                        <div className={style.rightImgBottom} onClick={this.goCurrentRoom}>
                                            <img className={style.downImg}
                                                 src={require('../../assets/image/n_down_small@2x.png')} alt=""/>
                                        </div>
                                    </div>

                                </div>
                            </div> : null}

                            {/* 位置共享 加入房间蒙板 */}
                            {mask_show ? <div className={style.sharePopupFa}>
                                <div className={style.sharePopupItem}>
                                    <div className={style.shareLeft}>
                                        <div className={style.shareLeftTop}>
                                            <p><span
                                                className={style.shareLeftNum}>{LocalCache.get('currentPostionShareInfo') ? LocalCache.get('currentPostionShareInfo').length : null}</span>人
                                            </p>
                                            <p>进行位置共享</p>
                                        </div>
                                        <div className={style.shareLeftBottom}>
                                            <p>房间号</p>
                                            <div className={style.shareCopy}>
                                                {/*<p id="text2">{roomId ? roomId : document.getElementById('roomId').value}</p>*/}
                                                <p id="text2">{roomId}</p>
                                                {/*<span className={style.shareLeftCopy} onClick={() => this.copyText2(roomId)}>复制</span>*/}
                                                <span className={style.shareLeftCopy}
                                                      onClick={this.copyArticle2}>复制</span>
                                            </div>
                                            <textarea id="input2" className={style.copyText}
                                                      onFocus={this.focusText}></textarea>
                                        </div>
                                    </div>

                                    <div className={style.shareRight}>
                                        {
                                            LocalCache.get('currentPostionShareInfo') ? LocalCache.get('currentPostionShareInfo').map((item, index) => {
                                                return (
                                                    <div key={item.mobilePhone}>
                                                        <p>{item.nickname ? item.nickname : item.mobilePhone}
                                                            <span>{`(楼层:  ${item.groupid - 1}F)`}</span></p></div>
                                                )
                                            }) : null
                                        }
                                    </div>
                                    <div className={style.rightImg}>
                                        <div className={style.rightImgTop} onClick={this.offMask}>
                                            <img className={style.offImg}
                                                 src={require('../../assets/image/n_off@2x.png')} alt=""/>
                                        </div>
                                        <div className={style.rightImgBottom} onClick={this.goCurrentRoom}>
                                            <img className={style.downImg}
                                                 src={require('../../assets/image/n_down_small@2x.png')} alt=""/>
                                        </div>
                                    </div>

                                </div>
                            </div> : null}

                            {Locale === "en" && showToastVoice ?
                                <div className={style.toastVoice}>{'Recording...'}</div> :
                                showToastVoice ? <div className={style.toastVoice}>{'录音中...'}</div> : null
                            }

                            {/*滑动面板开始的*/}
                            <div id="slideBoard" style={{display: showCardD}} className={style.slideBoard}>
                                {/*<div>
                                    <div className={style.uptype2Img}>
                                        {
                                            panelArrawDirectionB === "HALF" ?
                                                <img id="imgClick" onClick={self.onPullHalf}
                                                     src={require("../../assets/image/n_uptype2@2x.png")}/> : panelArrawDirectionB === "ALL" ?
                                                <img id="imgClick" onClick={self.onPullAll}
                                                     src={require("../../assets/image/n_uptype3@2x.png")}/> :
                                                <img id="imgClick" onClick={this.onPullInit}
                                                     src={require("../../assets/image/n_uptype1@2x.png")}/>
                                        }
                                    </div>
                                </div>*/}

                                {/*搜索框开始*/}
                                {showMapInput ?
                                    <SearchInput
                                        onChange={this.changeInput}
                                        handleClearEvent={this.clearInput}
                                        clearStatus={this.clearChangeStatue}
                                        searchValue={searchValue}
                                        onSubmit={this.handleKeywordSearch}
                                        clickVoice={this.handleClickVoice}
                                        props={this.props}
                                        ref="searchInput"
                                        onTouchStart={this.onTouchStart}
                                        onTouchEnd={this.onTouchEnd}
                                        onVoice={this.onVoice}
                                        resizeHeight={this.resizeHeight}
                                    /> : null}
                                {/*  搜索框结束 */}

                                <div id="bottomFooter" className={style.bottomFooter}>
                                    <div className={style.line}></div>
                                    <div className={style.tabbarFather}>
                                        <div className={style.tabbars}>
                                            <div className={style.tabDiv} onClick={self.clickMessageDetail}><img
                                                src={require("../../assets/image/n_tbar1@3x.png")}/></div>

                                            <div className={style.tabDiv} onClick={this.locationShare.bind(this)}><img
                                                src={require("../../assets/image/n_tabbarfx@3x.png")}/>
                                            </div>

                                            <div className={style.tabDiv} onClick={this.clickAR}><img
                                                src={require("../../assets/image/n_tabarar@3x.png")}/>
                                            </div>

                                            <div className={style.tabDiv} onClick={this.clickAR}><img
                                                src={require("../../assets/image/n_tabbarsm@3x.png")}/>
                                            </div>

                                            {/*<div onClick={this.PositionShare}><img
                                                src={require("../../assets/image/n_dbshare@2x.png")}/></div>*/}

                                            {/*<div onClick={this.collectList.bind(this)}><img
                                                src={require("../../assets/image/n_collect@2x.png")}/></div>*/}

                                            {/*<div onClick={this.clickMine}><img
                                                src={require("../../assets/image/n_tbar6@2x.png")}/></div>*/}

                                        </div>
                                    </div>
                                </div>

                                <div id="historySearch">
                                    {/*<h4>快速搜索历史查询</h4>*/}
                                    <HistorySearchNew handleKeywordSearch={this.handleKeywordSearch}
                                                      clickCurrentData={this.onKeywordDestination}
                                                      onRef2={this.onRef2}
                                                      onAddHistory={this.onAddHistory}
                                                      props={this.props}></HistorySearchNew>
                                </div>
                                {/*快捷搜索结束*/}

                            </div>
                            {/*  搜索面板结束*/}
                        </div>
                    )
                }
                <Toast icon="loading" show={isShowLoading}>{Lang.Loading}</Toast>
            </React.Fragment>
        )
    }
}

export default Map;
