import React, {Component} from 'react';
import SearchInputView from "../SearchPage/search_input";
import {Button} from 'react-weui/build/packages';
import style from './CurrentRoom.module.less'
import LocalCache from "../../utils/storage_cache";
import {AppCode, AppType, MapId} from "../../utils/config";
import {Toast} from "react-weui";
import {
    exitRoom,
    joinRoom,
    queryRoomInfo,
    updateLocationData
} from "../../utils/LocationShareWSUtil";
import qwest from "qwest";



class CurrentRoom extends Component {
    constructor() {
        super();
        this.state = {
            roomId: null,
            showToastRoom: false,
            message: '',
            currentUserNum: 0,
            joinedRoomId: 0
        };
        // //ios 苹果系统H5页面软键盘弹出造成点击事件失效 软键盘处理，页面错位恢复问题  参考文档 https://www.cnblogs.com/zzghk/p/11271804.html
        //    IOS 监听键盘
        var u = navigator.userAgent;
        //  var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

        document.body.addEventListener('focusin', () => {
            //软键盘弹出的事件处理
            if(isiOS) {
                console.error('IOS键盘弹起',isiOS);

            }
        })
        document.body.addEventListener('focusout', () => {
            //软键盘收起的事件处理

            if(isiOS) {
                console.error('IOS键盘收起',isiOS);
                document.body.scrollTop = 0;
            }
        })

    }

    showToastRoom = () => {
        this.setState({showToastRoom: true});

        this.state.toastTimerRoom = setTimeout(() => {
            this.setState({showToastRoom: false});
        }, 2000);
    }

    componentWillMount() {
        let that = this;
        that.setState({
            // roomId: that.props.location.state.roomId,
            currentUserNum: that.props.location.state.joinEd.currentUserNum,
            joinedRoomId: that.props.location.state.joinEd.roomId
        })
        console.log('传过来的已加入的房间信息', that.props.location.state.joinEd);

        updateLocationData(function (res) {
            LocalCache.set('currentPostionShareInfo',JSON.parse(res.data))
        });

        // let INQUERY_QUESTION_TYPE = "LAST_CAN_USE_ROOM_INFO";
        // let roomId = null;
        // queryRoomInfo(roomId,INQUERY_QUESTION_TYPE,function (res) {
        //     console.log(56565656,res)
        //         that.setState({
        //             currentUserNum: res.data.currentUserNum,
        //             joinedRoomId:res.data.roomId
        //         })
        // });

    }

    // 加入当前房间
    joinRoomWebSocket = () => {
        let self = this;
        let roomId = self.state.joinedRoomId;
        let INQUERY_QUESTION_TYPE = "ROOM_INFO";
        console.log("roomId: ", roomId);
        queryRoomInfo(roomId, INQUERY_QUESTION_TYPE, function () {
            joinRoom(roomId, function () {
                // self.props.history.push({pathname: '/', state: {maskJoinShow: true, roomId: self.state.joinedRoomId}});

                if(LocalCache.get('currentPostionShareInfo')) {
                    self.props.history.push({pathname: '/', state: {maskJoinShow: true, roomId: self.state.joinedRoomId}});
                    // window.location.href = '/?maskJoinShow=' + true + '&roomId=' + self.state.joinedRoomId
                }
                var timer3 = setInterval(() => {
                    updateLocationData(function (res) {
                        console.log('更新位置的返回信息==current==3333333333333', JSON.parse(res.data));
                        // LocalCache.set('currentPostionShareInfo',JSON.parse(res.data));
                        LocalCache.set('currentPostionShareInfo',JSON.parse(res.data));
                        // setTimeout(() => {
                        //     LocalCache.set('currentPostionShareInfo',JSON.parse(res.data));
                        // },0);
                        // 测试假数据
                        // let test = [
                        //     {
                        //         "appcode":"gzjbh_201911",
                        //         "currentTime":1600947146436,
                        //         "exitRoom":false,
                        //         "groupid":"2",
                        //         "mobilePhone":"18701975504",
                        //         "nickname":"若水",
                        //         "sessionId":"h2ceo4bpCBbf5vCmF5-j8BqiGN-vfKzbWDRlBMo8",
                        //         "unid":"196eeac94095a5dd8321d07d97068edb",
                        //         "venueuuid":"e7d31e40-b88e-40ce-b000-f18012c4d567",
                        //         "x":"13502771.760876795",
                        //         "y":"3657370.4721014188",
                        //         "z":"0.20000000298023224"
                        //     },
                        // ];
                        // LocalCache.set('currentPostionShareInfo',test);
                    });

                }, 3000);
                LocalCache.set('timer3', timer3);


            });
        });

    }


    // 退出当前房间按钮
    // offMask = () => {
    //     let self = this;
    //     exitRoom(function (res) {
    //         if (res.code == 0 && res.extraData == 'EXIT_ROOM') {
    //             // var timer1 = LocalCache.get('timer1');
    //             // var timer2 = LocalCache.get('timer2');
    //             // var timer3 = LocalCache.get('timer3');
    //             // clearInterval(timer1);
    //             // clearInterval(timer2);
    //             // clearInterval(timer3);
    //             self.props.history.push({pathname: '/positionshare'});
    //         }
    //     });
    // }

    offMask = () => {
        let self = this;
        let roomId = self.state.joinedRoomId;
        var paramsObj = {
            unid: LocalCache.get("userInfo").userUuid,
            venueuuid: MapId,
            appcode: AppCode,
            apptype: AppType,
            roomId: roomId
        }

        qwest.post("/manage/api/appclient/realTimeShareLocation/exitRoomInShareLocation", paramsObj)
            .then(function (xhr, res) {
                if (res.code == 0) {
                    console.error('成功退出当前房间123');
                    self.props.history.push({pathname: '/positionshare'});
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

    handleBack = () => {
        this.props.history.push({pathname: '/'});
    }

    render() {
        return (
            <div>
                {/* 返回 */}
                <SearchInputView {...this.props}/>
                {/*<div className={style.search_input_bd}>
                    <div className={style.search_input_back} onClick={this.handleBack}/>
                </div>*/}

                <Toast icon="warn" show={this.state.showToastRoom}>{this.state.message}</Toast>

                <div className={style.roomContent}>
                    <div className={style.roomContentFa}>
                        <div className={style.roomContentTitle}>{'加入过的房间'}</div>
                        <div className={style.roomContentTop}>
                            <p>房间号：<span>{this.state.joinedRoomId}</span></p>
                            <p>目前人数：<span className={style.personNum}>{this.state.currentUserNum}</span> 人</p>
                        </div>
                    </div>
                    <div className={style.bottomBtn}>
                        <Button className={style.quit} onClick={this.offMask}>{'退出当前房间'}</Button>
                        <Button className={style.join} onClick={this.joinRoomWebSocket}>{'加入当前房间'}</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default CurrentRoom;