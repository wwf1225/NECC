import React, {Component} from 'react';
import SearchInputView from "../SearchPage/search_input";
import './mine.less'
import {buttonPermision} from "../../api/app";
// import {notify} from "../../components/notify_toast/notify";
import {Lang} from "../../utils/translation";
import LocalCache from "../../utils/storage_cache";

class Mine extends Component {
    constructor() {
        super();
        this.state = {
            permisionList: [],
            userInfo: {}
        }
    }

    async getPermision() {
        var that = this;
        var paramsObj = {
            mobiletype: "20bc6effc2eb5c3ba3deafb6d5f8ab41"
        }
        await buttonPermision(paramsObj).then((res) => {
            // console.log(11111111,res);
            if (res.code !== 0) {
                // notify.show(`${Lang.TimeOut}`, 'error');
            } else {
                that.setState({
                    permisionList: res.data || []
                });
            }
        })
    }

    personalData = () => {
        // this.props.history.push({pathname: 'personaldata', state: {userInfo: this.props.location.state.userInfo}})
        this.props.history.push({pathname: 'personaldata'})
    }
    collectList = () => {
        this.props.history.push({pathname: 'search', state: {allButton: this.state.permisionList}});
    }
    quit = () => {
        this.props.history.go(-1);
        LocalCache.remove('userInfo');
    }
    componentWillMount() {
        let that = this;
        that.setState({
            userInfo:LocalCache.get('userInfo')
        })

    }

    componentDidMount() {
        let that = this;
        this.getPermision();
    }

    render() {
        return (
            <div className="mineCont">
                {/* 返回按钮 */}
                <SearchInputView {...this.props}/>
                <div className="content">
                    <div className="content-top">
                        {/*<div className="content-topImg"></div>*/}
                        <img className="content-topImg" src={`${LocalCache.get('userInfo').avatarUrl}`} />
                        <div className="nick">
                            <p className="nickname">{LocalCache.get('userInfo').nickname}</p>
                            <p className="nickphone">账号：<span>{LocalCache.get('userInfo').mobilePhone}</span></p>
                            {/*<p className="nickname">{(LocalCache.get('userInfo').nickname !== null) ? (LocalCache.get('userInfo').nickname) : ''}</p>*/}
                            {/*<p className="nickname">{this.state.userInfo.nickname}</p>*/}
                            {/*<p className="nickphone">账号：<span>{LocalCache.get('userInfo').mobilePhone}</span></p>*/}

                            {/*<p className="nickname">{(LocalCache.get('userInfo').nickname !== null) ? (LocalCache.get('userInfo').nickname) : (this.props.location.state.userInfo.nickname)}</p>*/}
                            {/*<p className="nickphone">账号：<span>{(LocalCache.get('userInfo').mobilePhone !== null) ? (LocalCache.get('userInfo').mobilePhone) : (this.props.location.state.userInfo.mobilePhone)}</span></p>*/}
                        </div>
                    </div>
                    <div className="line"></div>
                    <div className="content-midle">
                        <div className="content-midleList" onClick={this.personalData}>
                            <div className="content-midleListTitle">个人资料</div>
                            <div className="content-midleImg"></div>
                        </div>
                        <div className="content-midleList" onClick={this.collectList.bind(this)}>
                            <div className="content-midleListTitle">我的收藏</div>
                            <div className="content-midleImg"></div>
                        </div>
                    </div>
                    <div className="line"></div>
                    <div className="content-bottom">
                        <div className="quit" onClick={this.quit}>退出登入</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Mine;