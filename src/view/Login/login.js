import React, {Component} from 'react';
import {Button, Tab, NavBarItem, Toast} from 'react-weui';
import 'weui';
import 'react-weui/build/packages/react-weui.css';
import './login.less'
import SearchInputView from "../SearchPage/search_input";
import qwest from 'qwest'
import Timer from '../../components/timer/timer'
import {MapId, AppCode, AppType} from '../../utils/config'
import LocalCache from "../../utils/storage_cache";
import {Locale, Lang} from "../../utils/translation";
import {initialCollectList} from  "../../indoor_position/label_beacon";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countDownFlag: false,// 倒计时开始,默认false不开始
            showToastNickname: false,
            showToastAuthCode: false,
            showToastPhone: false,
            toastTimerNickname: null,
            toastTimerAuthCode: null,
            toastTimerPhone: null,
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

    showToastNickname = () => {
        this.setState({showToastNickname: true});

        this.state.toastTimerNickname = setTimeout(() => {
            this.setState({showToastNickname: false});
        }, 2000);
    }
    showToastAuthCode = () => {
        this.setState({showToastAuthCode: true});

        this.state.toastTimerAuthCode = setTimeout(() => {
            this.setState({showToastAuthCode: false});
        }, 2000);
    }
    showToastPhone = () => {
        this.setState({showToastPhone: true});

        this.state.toastTimerPhone = setTimeout(() => {
            this.setState({showToastPhone: false});
        }, 2000);
    }

    componentWillUnmount() {
        this.state.toastTimerNickname && clearTimeout(this.state.toastTimerNickname);
        this.state.toastTimerAuthCode && clearTimeout(this.state.toastTimerAuthCode);
        this.state.toastTimerPhone && clearTimeout(this.state.toastTimerPhone);
    }


    Register = () => {
        this.props.history.push({pathname: '/register', state: {}});
    }
    ForgetPassword = () => {
        this.props.history.push({pathname: '/forgetpassword', state: {}});
    }
    // 获取验证码 验证码直接登录注册
    getAuthCode = () => {
        let that = this;
        var phone = that.refs.inputVal.value;
        if (phone && /^1[3|4|5|8]\d{9}$/.test(phone)) {
            that.setState({
                countDownFlag: true
            })

        } else {
            that.showToastPhone();
            return
        }
        qwest.post("/usermanage/api/appclient/appUsers/getVerifyCode", {
                "appcode": AppCode,
                "apptype": AppType,
                "venueuuid": MapId,
                "mobilePhone": phone,
                "codeType": "2"
            }
        )
            .then(function (xhr, res) {
                console.log('验证码', res)
            })
            .catch(function (e, xhr, res) {
                console.error(e);
                console.error(res);
            })
            .complete(function () {
                // console.error("  ======  complete ======= ");
            });
    }


    // 手机验证码直接登录
    loginAuthCode = () => {
        var that = this;
        var phone = that.refs.inputVal.value;
        var authCode = that.refs.authCode.value;
        if(phone == '' || authCode == '') {
            return that.showToastPhone();
        }
        qwest.post("/usermanage/api/appclient/appUsers/userMobileVerifycodeRegisterAndLogin", {
                "appcode": AppCode,
                "apptype": AppType,
                "venueuuid": MapId,
                "mobilePhone": phone,
                "verifyCode": authCode
            }
        )
            .then(function (xhr, res) {
                if (res.code === 0) {
                    LocalCache.set('userInfo', res.data)
                    // that.props.history.push({pathname: '/mine'});
                    that.props.history.push({pathname: '/'});
                } else {
                    return that.showToastAuthCode();
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

    // 账号和密码登录
    loginPassword = () => {
        var that = this;
        var phone = that.refs.phone.value;
        var password = that.refs.password.value;
        if(phone == '' || password == '') {
            return that.showToastNickname();
        }
        qwest.post("/usermanage/api/appclient/appUsers/userLoginWithAccountAndPwd", {
                "appcode": AppCode,
                "apptype": AppType,
                "venueuuid": MapId,
                "mobilePhone": phone,
                "password": password
            }
        )
            .then(function (xhr, res) {
                console.log(22222, res)
                if (res.code == 0) {
                    LocalCache.set('userInfo', res.data);
                    let local = LocalCache.get('userInfo');
                    for (let key in local) {
                        local['password'] = password
                    }
                    LocalCache.set('userInfo', local);

                    initialCollectList();

                    that.props.history.push({pathname: '/'});
                } else {
                    return that.showToastNickname();
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

    componentDidMount() {

    }


    render() {
        return (
            <div>
                <div className="containers">

                    {/* 返回 */}
                    <SearchInputView {...this.props}/>
                    {Locale === "en" ? (
                        <Toast icon="warn" show={this.state.showToastNickname}>{`${Lang.toastAccPwd}`}</Toast>) : (
                        <Toast icon="warn" show={this.state.showToastNickname}>{`${Lang.toastAccPwd}`}</Toast>)}
                    {Locale === "en" ? (
                        <Toast icon="warn" show={this.state.showToastAuthCode}>{`${Lang.authCode}`}</Toast>) : (
                        <Toast icon="warn" show={this.state.showToastAuthCode}>{`${Lang.authCode}`}</Toast>)}
                    {Locale === "en" ? (
                        <Toast icon="warn" show={this.state.showToastPhone}>{`${Lang.toastPhone}`}</Toast>) : (
                        <Toast icon="warn" show={this.state.showToastPhone}>{`${Lang.toastPhone}`}</Toast>)}

                    {/*<Toast icon="warn" show={this.state.showToastNickname}>{"账户或密码不正确"}</Toast>
                    <Toast icon="warn" show={this.state.showToastAuthCode}>{"验证码不正确"}</Toast>
                    <Toast icon="warn" show={this.state.showToastPhone}>{"请输入正确的手机号码"}</Toast>*/}

                    <div style={{width: '100%', height: '80px'}}></div>

                    <div className="inputContain">
                        <div className='inputStyle'>
                            <div className='inputStyleCont'>
                                <div className="inputStyleItem">
                                    <img className="accImg" src={require("../../assets/image/n_accont_icon@2x.png")}
                                         alt=""/>
                                    <input ref="phone" className='inputStyle-one' type="number"
                                           placeholder={'请输入账号'}/>
                                </div>
                                <div className="inputStyleItem">
                                    <img className="passwordImg"
                                         src={require("../../assets/image/n_pwd_icon@2x.png")} alt=""/>
                                    <input ref="password" className='inputStyle-two' type="password"
                                           placeholder={'请输入密码'}/>
                                </div>
                            </div>

                        </div>
                        <div className='flex-row'>
                            <div className="register" onClick={this.Register}>免费注册</div>
                            <div className="password" onClick={this.ForgetPassword}>忘记密码?</div>
                        </div>
                        <Button className='login' onClick={this.loginPassword}>登入</Button>
                    </div>


                    {/*{Locale === "en" ? (<Tab type="navbar">
                        <NavBarItem label={`${Lang.accountLogin}`}>
                            <div className='inputStyle'>
                                <div className='inputStyleCont'>
                                    <div className="inputStyleItem">
                                        <img className="accImg" src={require("../../assets/image/n_accont_icon@2x.png")}
                                             alt=""/>
                                        <input ref="phone" className='inputStyle-one' type="number"
                                               placeholder={`${Lang.inputAccount}`}/>
                                    </div>
                                    <div className="inputStyleItem">
                                        <img className="passwordImg"
                                             src={require("../../assets/image/n_pwd_icon@2x.png")} alt=""/>
                                        <input ref="password" className='inputStyle-two' type="password"
                                               placeholder={`${Lang.inputPassword}`}/>
                                    </div>
                                </div>

                            </div>
                            <div className='flex-row'>
                                <div className="register" onClick={this.Register}>{`${Lang.freeReg}`}</div>
                                <div className="password" onClick={this.ForgetPassword}>{`${Lang.forgetPwd}?`}</div>
                            </div>
                            <Button className='login' onClick={this.loginPassword}>{`${Lang.login}`}</Button>
                        </NavBarItem>

                        <NavBarItem label={`${Lang.phoneLogin}`}>
                            <div className='inputStyle'>
                                <div className='inputStyleCont'>
                                    <div className="inputStyleItem">
                                        <img className="accImg" src={require("../../assets/image/n_accont_icon@2x.png")}
                                             alt=""/>
                                        <input ref="inputVal" className='inputStyle-thr' type="number"
                                               placeholder={`${Lang.inputPhone}`}/>
                                    </div>
                                    <div className="inputStyleItem">
                                        <img className="passwordImg"
                                             src={require("../../assets/image/n_pwd_icon@2x.png")} alt=""/>
                                        <input ref="authCode" className='inputStyle-four' type="text"
                                               placeholder={`${Lang.inputAuthCode}`}/>
                                        <div className="getCode">
                                            <span className="vertial">|</span>
                                            <span onClick={this.getAuthCode} className='code'><Timer
                                                countDownFlag={this}
                                                onRef={this.onRef}/></span>

                                        </div>

                                    </div>
                                </div>

                            </div>
                            <div className='flex-row'>
                                <div className="register" onClick={this.Register}>{`${Lang.freeReg}`}</div>
                            </div>
                            <Button className='login' onClick={this.loginAuthCode}>{`${Lang.login}`}</Button>
                        </NavBarItem>
                    </Tab>) : (<Tab type="navbar">
                        <NavBarItem label="账号登入">
                            <div className='inputStyle'>
                                <div className='inputStyleCont'>
                                    <div className="inputStyleItem">
                                        <img className="accImg" src={require("../../assets/image/n_accont_icon@2x.png")}
                                             alt=""/>
                                        <input ref="phone" className='inputStyle-one' type="number"
                                               placeholder={'请输入账号'}/>
                                    </div>
                                    <div className="inputStyleItem">
                                        <img className="passwordImg"
                                             src={require("../../assets/image/n_pwd_icon@2x.png")} alt=""/>
                                        <input ref="password" className='inputStyle-two' type="password"
                                               placeholder={'请输入密码'}/>
                                    </div>
                                </div>

                            </div>
                            <div className='flex-row'>
                                <div className="register" onClick={this.Register}>免费注册</div>
                                <div className="password" onClick={this.ForgetPassword}>忘记密码?</div>
                            </div>
                            <Button className='login' onClick={this.loginPassword}>登入</Button>
                        </NavBarItem>

                        <NavBarItem label="手机号登入">
                            <div className='inputStyle'>
                                <div className='inputStyleCont'>
                                    <div className="inputStyleItem">
                                        <img className="accImg" src={require("../../assets/image/n_accont_icon@2x.png")}
                                             alt=""/>
                                        <input ref="inputVal" className='inputStyle-thr' type="number"
                                               placeholder={'请输入手机号'}/>
                                    </div>
                                    <div className="inputStyleItem">
                                        <img className="passwordImg"
                                             src={require("../../assets/image/n_pwd_icon@2x.png")} alt=""/>
                                        <input ref="authCode" className='inputStyle-four' type="text"
                                               placeholder={'请输入验证码'}/>
                                        <div className="getCode">
                                            <span className="vertial">|</span>
                                            <span onClick={this.getAuthCode} className='code'><Timer
                                                countDownFlag={this}
                                                onRef={this.onRef}/></span>

                                        </div>

                                    </div>
                                </div>

                            </div>
                            <div className='flex-row'>
                                <div className="register" onClick={this.Register}>免费注册</div>
                            </div>
                            <Button className='login' onClick={this.loginAuthCode}>登入</Button>
                        </NavBarItem>
                    </Tab>)}*/}


                    {/* <Tab type="navbar">
                        <NavBarItem label="账号登入">
                            <div className='inputStyle'>
                                <div className='inputStyleCont'>
                                    <div className="inputStyleItem">
                                        <img className="accImg" src={require("../../assets/image/n_accont_icon@2x.png")}
                                             alt=""/>
                                        <input ref="phone" className='inputStyle-one' type="number"
                                               placeholder={'请输入账号'}/>
                                    </div>
                                    <div className="inputStyleItem">
                                        <img className="passwordImg"
                                             src={require("../../assets/image/n_pwd_icon@2x.png")} alt=""/>
                                        <input ref="password" className='inputStyle-two' type="password"
                                               placeholder={'请输入密码'}/>
                                    </div>
                                </div>

                            </div>
                            <div className='flex-row'>
                                <div className="register" onClick={this.Register}>免费注册</div>
                                <div className="password" onClick={this.ForgetPassword}>忘记密码?</div>
                            </div>
                            <Button className='login' onClick={this.loginPassword}>登入</Button>
                        </NavBarItem>

                        <NavBarItem label="手机号登入">
                            <div className='inputStyle'>
                                <div className='inputStyleCont'>
                                    <div className="inputStyleItem">
                                        <img className="accImg" src={require("../../assets/image/n_accont_icon@2x.png")} alt=""/>
                                        <input ref="inputVal" className='inputStyle-thr' type="number"
                                               placeholder={'请输入手机号'}/>
                                    </div>
                                    <div className="inputStyleItem">
                                        <img className="passwordImg" src={require("../../assets/image/n_pwd_icon@2x.png")} alt=""/>
                                        <input ref="authCode" className='inputStyle-four' type="text"
                                               placeholder={'请输入验证码'}/>
                                        <div className="getCode">
                                            <span className="vertial">|</span>
                                            <span onClick={this.getAuthCode} className='code'><Timer
                                                countDownFlag={this}
                                                onRef={this.onRef}/></span>

                                        </div>

                                    </div>
                                </div>

                            </div>
                            <div className='flex-row'>
                                <div className="register" onClick={this.Register}>免费注册</div>
                            </div>
                            <Button className='login' onClick={this.loginAuthCode}>登入</Button>
                        </NavBarItem>
                    </Tab>*/}


                   {/* <div className="lineFa">
                        <div className="lineA"></div>
                    </div>*/}

                    {Locale === "en" ? (<div id="footers" className="bottomItem">
                        <div className="loginBottom">
                            {/*<div className="loginBottomA">
                                <img className="login_wx" src={require("../../assets/image/n_login_wx@2x.png")} alt=""/>
                                <p>{`${Lang.weChatLogin}`}</p>
                            </div>*/}

                            <div className="loginBottomB">
                                <img className="login_logo" src={require("../../assets/image/n_login_dlz@2x.png")}
                                     alt=""/>
                                <p>{`${Lang.Expo}`}</p>
                                <p>{`${Lang.Tongji}`}</p>
                            </div>
                        </div>
                    </div>) : (<div id="footers" className="bottomItem">
                        <div className="loginBottom">
                            {/*<div className="loginBottomA">
                                <img className="login_wx" src={require("../../assets/image/n_login_wx@2x.png")} alt=""/>
                                <p>微信一键登入</p>
                            </div>*/}
                            <div className="loginBottomB">
                                <img className="login_logo" src={require("../../assets/image/n_login_dlz@2x.png")}
                                     alt=""/>
                                <p>中国国际进口博览会战略合作伙伴</p>
                                <p>上海同济大学定位导航实验室</p>
                            </div>
                        </div>
                    </div>) }





                    {/*<div id="footers" className="bottomItem">
                        <div className="loginBottom">
                            <div className="loginBottomA">
                                <img className="login_wx" src={require("../../assets/image/n_login_wx@2x.png")} alt=""/>
                                <p>微信一键登入</p>
                            </div>
                            <div className="loginBottomB">
                                <img className="login_logo" src={require("../../assets/image/n_login_dlz@2x.png")}
                                     alt=""/>
                                <p>中国国际进口博览会战略合作伙伴</p>
                                <p>上海同济大学定位导航实验室</p>
                            </div>
                        </div>
                    </div>*/}

                </div>
            </div>
        );
    }
}

export default Login;