import React, {Component} from 'react';
import SearchInputView from "../SearchPage/search_input";
import style from './ForgetPassword.module.less'
import {Button, Toast, Icon} from 'react-weui';
import Timer from "../../components/timer/timer";
import qwest from "qwest";
import {AppCode, AppType, MapId} from "../../utils/config";
// import Notifications, {notify} from 'react-notify-toast';
// import {notify} from '../../components/notify_toast/notify';

class ForgetPassword extends Component {
    constructor() {
        super();
        this.state = {
            showToast: false,
            showToastRegister: false,
            showSucess: false,
            showError: false,
            showSucessNew: false,
            showErrorNew: false,
            toastTimer: null,
            showSucessA: 'none',
            showErrorA: 'none',
            opacitySucess: 0,
            opacityError: 0,

        }

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
        }, 2000);
    }

    showToastRegister = () => {
        this.setState({showToastRegister: true});

        this.state.toastTimer = setTimeout(() => {
            this.setState({showToastRegister: false});
        }, 2000);
    }

    // 获取验证码 忘记密码
    getAuthCode = () => {
        var phone = this.refs.inputVal.value;
        if (phone && /^1[3|4|5|8]\d{9}$/.test(phone)) {

        } else {
            // notify.show(`${Lang.CloseDialog}`, 'warning');
            // notify.show("请输入正确的手机号码", 'warning');
            // Toast.info("请输入正确的手机号码");
            return
        }
        qwest.post("/usermanage/api/appclient/appUsers/getVerifyCode", {
                "appcode": AppCode,
                "apptype": AppType,
                "venueuuid": MapId,
                "mobilePhone": phone,
                "codeType": "3"
            }
        )
            .then(function (xhr, res) {
                console.log('验证码：', res)
                console.error(res);
            })
            .catch(function (e, xhr, res) {
                // Process the error
                console.error(e);
                console.error(res);
            })
            .complete(function () {
                // console.error("  ======  complete ======= ");
            });
    }

    // 确定
    confirm = () => {
        let that = this;
        var phone = that.refs.inputVal.value;
        var authCode = that.refs.authCode.value;
        var newPassword = that.refs.newPassword.value;
        if (phone == '' || phone == undefined || authCode == '' || authCode == undefined || newPassword == '' || newPassword == undefined) {
            // return notify.show("请填写完整信息", 'error');
            // notify.show("请填写完整信息", 'warning');
            // return  notify.show("请填写完整信息", 'warning');

            that.showToast();

        }

        qwest.post("/usermanage/api/appclient/appUsers/forgetPwdAndUpdatePwd", {
                "appcode": AppCode,
                "apptype": AppType,
                "venueuuid": MapId,
                "mobilePhone": phone,
                "verifyCode": authCode,
                "newPwd": newPassword
            }
        )
            .then(function (xhr, res) {
                if (res.code === 0) {
                    console.log('修改密码成功', res);
                    that.props.history.push({pathname: '/login'});
                }
            })
            .catch(function (e, xhr, res) {
                // Process the error
                console.error(e);
                console.error(res);
            })
            .complete(function () {
                // console.error("  ======  complete ======= ");
            });
    }
    // 手机号码校验显示对错
    onBlurPhone = () => {
        let that = this;
        let phone = that.refs.inputVal.value;
        if (phone && /^1[3|4|5|8]\d{9}$/.test(phone)) {
            // that.setState({
            //     opacitySucess: 1,
            //     opacityError: 0,
            // })
        } else {
            return that.setState({
                opacitySucess: 0,
                opacityError: 1,
            })
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
                        that.setState({
                            opacitySucess: 1,
                            opacityError: 0,
                        })
                    } else {
                        that.showToastRegister();
                        that.setState({
                            opacitySucess: 0,
                            opacityError: 1,
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
    // 校验新密码显示对错
    newPassword = () => {
        let that = this;
        let newPassword = that.refs.newPassword.value;
        if (5 < newPassword.length && newPassword.length < 11) {
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


    /**
     * 验证码倒计时  这个使用父容器去子容器中取值
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

    componentWillUnmount() {
        this.state.toastTimer && clearTimeout(this.state.toastTimer);
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
            <div>
                {/* 返回 */}
                {/*<SearchInputView {...this.props}/>*/}
                <div className={style.search_input_bd}>
                    <div className={style.search_input_back} onClick={this.handleBack}/>
                </div>

                {/*<Notifications/>*/}
                {/*<Toast icon="success-no-circle" show={this.state.showToast}>Done</Toast>*/}
                <Toast icon="warn" show={this.state.showToast}>{"请填写完整信息"}</Toast>
                <Toast icon="warn" show={this.state.showToastRegister}>{"此手机号还未注册，请先去注册"}</Toast>


                <div className={style.content}>
                    <div className={style.title}>
                        <div className={style.account}>账号</div>
                        <div className={style.account}>验证码</div>
                        <div className={style.account}>新密码</div>
                    </div>
                    <div>
                        <div className={style.accountInpFa}>
                            <input ref="inputVal" className={style.accountInp} type="number" placeholder={'请输入手机号'}
                                   onBlur={this.onBlurPhone}/>
                            {/*{this.state.showSucess ? <Icon value="success-no-circle"/> : this.state.showError ? <Icon value="cancel"/> : ''}*/}

                            {/*<Icon style={{display: showSucessA, float: 'right', 'margin-top': '7.2vw'}} value="success-no-circle"/>*/}
                            {/*<Icon style={{display: showErrorA, float: 'right', 'margin-top': '7.2vw'}} value="cancel"/>*/}

                            <div className={style.opacityIcon}>
                                <Icon style={{opacity: opacitySucess, float: 'right', marginTop: '7.2vw'}}
                                      value="success-no-circle"/>
                                <Icon style={{opacity: opacityError, float: 'right', marginTop: '7.2vw'}}
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
                            <input ref="newPassword" className={style.accountInp} type="password"
                                   placeholder={'6-10位数字或字母组成'} onBlur={this.newPassword}/>
                            {this.state.showSucessNew ? <Icon value="success-no-circle"/> : this.state.showErrorNew ?
                                <Icon value="cancel"/> : ''}
                        </div>
                    </div>

                </div>
                <Button className={style.confirm} onClick={this.confirm}>确定</Button>

            </div>
        );
    }
}

export default ForgetPassword;