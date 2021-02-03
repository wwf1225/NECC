import React, {Component} from 'react';
import style from './PositionShare.module.less';
import {MapId, AppCode, AppType} from "../../utils/config";
import {Lang} from "../../utils/translation";
import {Toast} from "react-weui";
import LocalCache from "../../utils/storage_cache";
import {
    errorCallback,
    createRoom,
    joinRoom,
    queryRoomInfo,
    updateLocationData
} from "../../utils/LocationShareWSUtil";



class PositionShare extends Component {
    constructor() {
        super();
        this.state = {
            showToastRoom: false,
            showToastRum: false,
            showToastSystem: false,
            poiData: {},
        }
    }

    showToastRoom = () => {
        this.setState({showToastRoom: true});

        setTimeout(() => {
            this.setState({showToastRoom: false});
        }, 2000);
    }

    showToastRum = () => {
        this.setState({showToastRum: true});

        setTimeout(() => {
            this.setState({showToastRum: false});
        }, 2000);
    }

    showToastSystem = () => {
        this.setState({showToastSystem: true});

        setTimeout(() => {
            this.setState({showToastSystem: false});
        }, 2000);
    }

    componentWillMount() {

    }

    // 创建房间
    creatWebSocket = () => {
        let self = this;
        console.log('创建房间', self.state.poiData);
        var POI = LocalCache.get('poi_positonshare');
        // 初始化创建websocket
        // initLocationShareWS();
        // 执行创建房间
        createRoom(function (res) {
            self.props.history.push({pathname: '/', state: {creatShow: true, roomId: res.data}});
        });
    }

    // 加入房间
    joinRoomWebSocket = () => {
        let self = this;
        let roomId = document.getElementById('roomId').value;
        let INQUERY_QUESTION_TYPE = "ROOM_INFO";
        console.log("roomId: ", roomId);

        errorCallback(function (res) {
            console.error('错误回调111111',res);
            if(res.code == 1) {
                self.showToastRoom();
            }else if(res.code == 2) {
                self.showToastRum();
            }else {
                self.showToastSystem();
            }
        })

        queryRoomInfo(roomId, INQUERY_QUESTION_TYPE, function () {
            joinRoom(roomId, function (res) {
                // self.props.history.push({pathname: '/', state: {maskShow: true,roomId:roomId}});

                if (LocalCache.get('currentPostionShareInfo')) {
                    // console.log(87878787,self.props);
                    self.props.history.push({pathname: '/', state: {maskShow: true, roomId: roomId}});
                }

                var timer3 = setInterval(() => {
                    updateLocationData(function (res) {
                        console.log('更新位置的返回信息==positionshare==3333333333333', JSON.parse(res.data));
                        LocalCache.set('currentPostionShareInfo', JSON.parse(res.data));
                        // setTimeout(() => {
                        //     LocalCache.set('currentPostionShareInfo', JSON.parse(res.data));
                        // }, 0);
                    });

                }, 3000);
                LocalCache.set('timer3', timer3);
            });
        });

    }

    // 返回
    handleBack = () => {
        this.props.history.push({pathname: '/', state: {maskExit: true, exitRoomMark: true, mapClickFlag: true}});
        var slideBoard = document.getElementById('slideBoard');
        if (slideBoard) {
            slideBoard.style.top = '75%';
            slideBoard.style.height = '25%';
        }
    }

    render() {
        return (
            <div>
                {/* 返回 */}
                {/*<SearchInputView {...this.props} />*/}

                <Toast icon="warn" show={this.state.showToastRoom}>{'房间不存在'}</Toast>
                <Toast icon="warn" show={this.state.showToastRum}>{'房间人数已满'}</Toast>
                <Toast icon="warn" show={this.state.showToastSystem}>{'系统错误'}</Toast>

                <div className={style.search_input_bd}>
                    <div className={style.search_input_back} onClick={this.handleBack}/>
                </div>

                <div className={style.shareContent}>
                    <div className={style.creatRoom} onClick={this.creatWebSocket}>
                        <p className={style.creatTitle}>创建房间</p>
                    </div>
                    <div className={style.joinRoom}>
                        <p className={style.joinTitle} onClick={this.joinRoomWebSocket}>加入房间</p>
                        <input id="roomId" className={style.joinInp} type="number" placeholder="请输入房间号"/>
                    </div>
                </div>
            </div>
        );
    }
}

export default PositionShare;