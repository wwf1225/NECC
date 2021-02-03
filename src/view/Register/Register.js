import React, {Component} from 'react';
import SearchInputView from "../SearchPage/search_input";
import {Button, Icon, Toast} from "react-weui";
import style from './Register.module.less'
import {notify} from "react-notify-toast";
import qwest from "qwest";
import {AppCode, AppType, MapId} from "../../utils/config";
import Timer from "../../components/timer/timer";

class Register extends Component {
    constructor() {
        super();
        this.state = {
            showToast: false,
            showToastNickname: false,
            showToastPhone: false,
            showToastAll: false,
            showSucess: false,
            showError: false,
            showSucessNew: false,
            showErrorNew: false,
            showSucessNickname: false,
            showErrorNickname: false,
            toastTimer: null,
            toastTimerNickname: null,
            opacitySucess: 0,
            opacityError: 0,
        }
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

    showToast = () => {
        this.setState({showToast: true});

        this.state.toastTimer = setTimeout(() => {
            this.setState({showToast: false});
        }, 3000);
    }

    showToastNickname = () => {
        this.setState({showToastNickname: true});

        this.state.toastTimerNickname = setTimeout(() => {
            this.setState({showToastNickname: false});
        }, 3000);
    }

    showToastPhone = () => {
        this.setState({showToastPhone: true});

        this.state.toastTimerPhone = setTimeout(() => {
            this.setState({showToastPhone: false});
        }, 2000);
    }
    showToastAll = () => {
        this.setState({showToastAll: true});

        this.state.toastTimerAll = setTimeout(() => {
            this.setState({showToastAll: false});
        }, 2000);
    }

    // 手机号码校验显示对错
    onBlurPhone = () => {
        let that = this;
        let phone = that.refs.inputVal.value;
        if (phone && /^1[3|4|5|8]\d{9}$/.test(phone)) {
            // that.setState({
            //     showSucess: true,
            //     opacitySucess: 1,
            //     opacityError: 0,
            // })
        } else {
            that.setState({
                showSucess: false,
                showError: true,
                opacitySucess: 0,
                opacityError: 1,
            })
            return that.showToastPhone();
        }
        qwest.post("/usermanage/api/appclient/appUsers/findMobilePhoneExist", {
                "appcode": AppCode,
                "apptype": AppType,
                "venueuuid": MapId,
                "mobilePhone": phone
            }
        )
            .then(function (xhr, res) {
                if (res.code == 0) {
                    if (res.data[0].exist == 1) {
                        that.showToast();
                        that.setState({
                            showSucess: false,
                            showError: true,
                            opacitySucess: 0,
                            opacityError: 1,
                        })
                    } else {
                        that.setState({
                            showSucess: true,
                            showError: false,
                            opacitySucess: 1,
                            opacityError: 0,
                        })
                    }
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

    // 昵称校验显示对错
    findNicknameExist = () => {
        let that = this;
        let nickname = that.refs.nickname.value;
        qwest.post("/usermanage/api/appclient/appUsers/findNicknameExist", {
                "appcode": AppCode,
                "apptype": AppType,
                "venueuuid": MapId,
                "nickname": nickname
            }
        )
            .then(function (xhr, res) {
                if (res.code === 0) {
                    if (res.data == 1) {
                        that.showToastNickname();
                        that.setState({
                            showSucessNickname: false,
                            showErrorNickname: true
                        })
                    } else {
                        that.setState({
                            showSucessNickname: true,
                            showErrorNickname: false
                        })
                    }
                }
                // console.log("12121212", res)
            })
            .catch(function (e, xhr, res) {
                console.error(e);
                console.error(res);
            })
            .complete(function () {
                // console.error("  ======  complete ======= ");
            });
    }


    // 校验新密码显示对错
    newPassword = () => {
        let that = this;
        let password = that.refs.password.value;
        if (5 < password.length && password.length < 11) {
            that.setState({
                showSucessNew: true
            })
        } else {
            that.setState({
                showSucessNew: false,
                showErrorNew: true
            })
        }

    }

    // 注册时候获取验证码
    getAuthCode = () => {
        var phone = this.refs.inputVal.value;
        if (phone && /^1[3|4|5|8]\d{9}$/.test(phone)) {

        } else {
            this.showToastPhone();
            return
        }
        qwest.post("/usermanage/api/appclient/appUsers/getVerifyCode", {
                "appcode": AppCode,
                "apptype": AppType,
                "venueuuid": MapId,
                "mobilePhone": phone,
                "codeType": "1"
            }
        )
            .then(function (xhr, res) {
                console.log("注册验证码：", res)
                console.error(res);
            })
            .catch(function (e, xhr, res) {
                console.error(e);
                console.error(res);
            })
            .complete(function () {
                // console.error("  ======  complete ======= ");
            });
    }

    /**
     * 验证码倒计时 这个使用父容器去子容器中取值
     * @param nextProps
     */
    onRef = (ref) => {
        this.child = ref
    };
    /**
     * 这个使用父容器去子容器中取值 调用获取短信验证码
     * @param nextProps
     */
    click = (e) => {
        this.child.countDown()
    };


// 注册
    register = () => {
        var that = this;
        var phone = that.refs.inputVal.value;
        var password = that.refs.password.value;
        var authCode = that.refs.authCode.value;
        var email = that.refs.email.value;
        var userJob = that.refs.userJob.value;
        var userRegion = that.refs.userRegion.value;
        var nickname = that.refs.nickname.value;
        if (phone && /^1[3|4|5|8]\d{9}$/.test(phone)) {

        } else {
            that.showToastPhone();
            return
        }
        if ((phone == '' || phone == undefined) || (authCode == '' || authCode == undefined) || (password == '' || password == undefined) || (nickname == '' || nickname == undefined)) {
            that.showToastAll();
            return;
        }

        qwest.post("/usermanage/api/appclient/appUsers/userAccountPasswordRegister", {
                "appcode": AppCode,
                "apptype": AppType,
                "venueuuid": MapId,
                "mobilePhone": phone,
                "password": password,
                "verifyCode": authCode,
                "email": email,
                "userJob": userJob,
                "userRegion": userRegion,
                "nickname": nickname,
                "gender": 1,
                "systemtype": "",
                "modeltype": ""
            }
        )
            .then(function (xhr, res) {
                if (res.code === 0) {
                    that.props.history.push({pathname: 'login'});
                }

            })
            .catch(function (e, xhr, res) {
                // Process the error
                console.error(e);
                console.error(res);
            })
            .complete(function () {
                console.error("  ======  complete ======= ");
            });
    }

    componentWillUnmount() {
        this.state.toastTimer && clearTimeout(this.state.toastTimer);
        this.state.toastTimerNickname && clearTimeout(this.state.toastTimerNickname);
        this.state.toastTimerPhone && clearTimeout(this.state.toastTimerPhone);
        this.state.toastTimerAll && clearTimeout(this.state.toastTimerAll);
    }

    handleBack = () => {
        this.props.history.go(-1);
    }

    render() {
        const {
            opacitySucess,
            opacityError
        } = this.state
        return (
            <div className={style.registerCont}>
                {/* 返回 */}
                {/*<SearchInputView {...this.props}/>*/}
                <div className={style.search_input_bd}>
                    <div className={style.search_input_back} onClick={this.handleBack}/>
                </div>

                <Toast icon="warn" show={this.state.showToast}>{"此手机号码已注册，请直接登录"}</Toast>
                <Toast icon="warn" show={this.state.showToastNickname}>{"此昵称已经被注册"}</Toast>
                <Toast icon="warn" show={this.state.showToastPhone}>{"请输入有效的手机号码"}</Toast>
                <Toast icon="warn" show={this.state.showToastAll}>{"请填写必填的信息"}</Toast>


                <div className={style.content}>
                    <div className={style.title}>
                        <div className={style.account0}><span style={{color: 'red'}}>*</span>账号</div>
                        <div className={style.account1}><span style={{color: 'red'}}>*</span>验证码</div>
                        <div className={style.account2}><span style={{color: 'red'}}>*</span>密码</div>
                        <div className={style.account3}><span style={{color: 'red'}}>*</span>昵称</div>
                    </div>
                    <div>
                        <div className={style.accountInpFa}>
                            <input ref="inputVal" className={style.accountInp} type="number" placeholder={'请输入手机号'}
                                   onBlur={this.onBlurPhone}/>
                            {/*{this.state.showSucess ? <Icon value="success-no-circle"/> : this.state.showError ?*/}
                            {/*    <Icon value="cancel"/> : ''}*/}

                            <div className={style.opacityIcon}>
                                <Icon style={{opacity: opacitySucess, float: 'right', marginTop: '1.5vw'}}
                                      value="success-no-circle"/>
                                <Icon style={{opacity: opacityError, float: 'right', marginTop: '1.5vw'}}
                                      value="cancel"/>
                            </div>
                        </div>

                        <div className={style.codes}>
                            <input ref="authCode" className={style.accountInp} type="number"/>
                            <div className={style.getCode}><span className={style.line}>|</span> <span
                                onClick={this.getAuthCode}
                                className={style.codeA}><Timer countDownFlag={this}
                                                               onRef={this.onRef}/></span></div>
                        </div>
                        <div>
                            <input ref="password" className={style.accountInp} type="password"
                                   placeholder={'6-10位数字或字母组成'} onBlur={this.newPassword}/>
                            {this.state.showSucessNew ? <Icon value="success-no-circle"/> : this.state.showErrorNew ?
                                <Icon value="cancel"/> : ''}
                        </div>
                        <div>
                            <input ref="nickname" className={style.accountInp} type="text"
                                   onBlur={this.findNicknameExist}/>
                            {this.state.showSucessNickname ?
                                <Icon value="success-no-circle"/> : this.state.showErrorNickname ?
                                    <Icon value="cancel"/> : ''}
                        </div>
                    </div>

                </div>
                <div className={style.info}>
                    <div className={style.infoFa}><span className={style.infoline}>_________________</span><span
                        className={style.infoCont}>完善信息</span><span className={style.infoline}>__________________</span>
                    </div>
                </div>


                <div className={style.contentB}>
                    <div className={style.titleB}>
                        <div className={style.accountB0}>性别</div>
                        <div className={style.accountB}>职业</div>
                        <div className={style.accountB1}>所在地区</div>
                        <div className={style.accountB2}>邮箱</div>
                    </div>
                    <div>
                        <input ref="gender" className={style.accountInpB} type="text"/>
                        <input ref="userJob" className={style.accountInpB} type="text"/>
                        <input ref="userRegion" className={style.accountInpB} type="text"/>
                        <input ref="email" className={style.accountInpB} type="text"/>
                    </div>

                </div>


                <Button onClick={this.register} className={style.confirm}>注册</Button>
            </div>
        );
    }
}

export default Register;