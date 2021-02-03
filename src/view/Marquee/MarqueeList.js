import React, {Component} from 'react';
import SearchInputView from "../SearchPage/search_input";
import './MarqueeList.less'
import qwest from "qwest";
import {AppCode, AppType, MapId} from "../../utils/config";
import LocalCache from "../../utils/storage_cache";
import {Locale} from "../../utils/translation";
import style from "../Register/Register.module.less";

class MarqueeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            marqueeList: []
        }
    }

    goMarqueeDetail(nmuuid) {
        LocalCache.set("nmuuid",nmuuid);
        this.props.history.push({pathname: 'marqueedetail'})
    }
    // 获取通知列表
    getMarqueeList = () => {
        let that = this;
        qwest.post("/manage/api/appclient/noticemessage/clientGetNoticeMessage", {
                "appcode": AppCode,
                "apptype": AppType,
                "venueuuid": MapId,
                // "codeType": "2",
                "unid": LocalCache.get("openID"),
                "important": 0
            }
        )
            .then(function (xhr, res) {
                if (res.code == 0) {
                    console.log('消息列表：', res)
                    that.setState({
                        marqueeList: res.data
                    })
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

    componentDidMount() {
        let self = this;
        self.getMarqueeList();
        // var digit=document.getElementById('back');
        // digit.addEventListener('touchend',function(){
        //     self.props.history.push({pathname: '/'});
        // });

    }
    handleBack = () => {
        // this.props.history.go(-1);
        this.props.history.push({pathname: '/'});
    }

    render() {
        return (
            <div className="marqueeCard">
                {/* 返回按钮 */}
                {/*<SearchInputView {...this.props}/>*/}

                <div className={style.search_input_bd}>
                    <div id="back" className={style.search_input_back} onClick={this.handleBack}/>
                </div>

                {/*<div className={style.search_input_bd} onClick={this.handleBack}>
                    <img className={style.search_input_back} src={require("../../assets/image/n_back@3x.png")} />
                </div>*/}
                <div className="line"></div>


                {/*<div className="cards">
                    {
                        this.state.marqueeList.map((item, index) => {
                            return (<div className="card" key={index}>
                                <div className="cardTop">
                                    <div className="cardTopImgs">
                                        <div className="cardTopImg"></div>
                                        <div className="cardTopImgOne">活动通知</div>
                                    </div>
                                    <div className="cardTopDate">{item.create_time}</div>
                                </div>
                                <div className="cardTitle">{item.title}</div>
                                <div className="cardButton" onClick={() => {this.goMarqueeDetail(item.nmuuid)}}>
                                    <div className="cardButton_one">查看详情&nbsp;</div>
                                    <div className="cardButton_two"></div>
                                </div>
                            </div>)

                        })
                    }
                </div>*/}


                {Locale === "en" ? <div className="cards">
                    {
                        this.state.marqueeList.map((item, index) => {
                            return (<div className="card" key={index}>
                                <div className="cardTop">
                                    <div className="cardTopImgs">
                                        <div className="cardTopImg"></div>
                                        <div className="cardTopImgOne">{'Activity Notification'}</div>
                                    </div>
                                    <div className="cardTopDate">{item.create_time}</div>
                                </div>
                                <div className="cardTitle">{item.entitle}</div>
                                <div className="cardButton" onClick={() => {this.goMarqueeDetail(item.nmuuid)}}>
                                    <div className="cardButton_one">{'Details'}&nbsp;</div>
                                    <div className="cardButton_two"></div>
                                </div>
                            </div>)

                        })
                    }
                </div> : <div className="cards">
                    {
                        this.state.marqueeList.map((item, index) => {
                            return (<div className="card" key={index} onClick={() => {this.goMarqueeDetail(item.nmuuid)}}>
                                <div className="cardTop">
                                    <div className="cardTopImgs">
                                        <div className="cardTopImg"></div>
                                        <div className="cardTopImgOne">活动通知</div>
                                    </div>
                                    <div className="cardTopDate">{item.create_time}</div>
                                </div>
                                <div className="cardTitle">{item.title}</div>
                                <div className="cardButton">
                                    <div className="cardButton_one">查看详情&nbsp;</div>
                                    <div className="cardButton_two"></div>
                                </div>
                            </div>)

                        })
                    }
                </div>}


            </div>
        );
    }
}

export default MarqueeList;