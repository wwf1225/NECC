import React, {Component} from 'react';
import SearchInputView from "../SearchPage/search_input";
import './personalData.less'
import qwest from 'qwest'
import {notify} from "react-notify-toast";
import {Radio, CellBody, CellFooter, Form, FormCell, Toast} from 'react-weui';
import urlImg from '../../assets/image/n_login_dlz@2x.png'
import LocalCache from "../../utils/storage_cache";
import {AppCode, AppType, MapId} from "../../utils/config";


class PersonalData extends Component {
    constructor() {
        super();
        this.state = {
            userInfo: {},
            param2: {},
            male: false,
            female: false,
            gender: 1,
            showToastNickname: false,
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

    showToastNickname = () => {
        this.setState({showToastNickname: true});

        this.state.toastTimerNickname = setTimeout(() => {
            this.setState({showToastNickname: false});
        }, 3000);
    }

    // 修改用户信息
    modifyUserInformation = (gender) => {
        let that = this;
        let nickname = document.getElementById('nickname').value;
        let password = document.getElementById('password').value;
        let userJob = document.getElementById('userJob').value;
        let userRegion = document.getElementById('userRegion').value;
        let email = document.getElementById('email').value;
        qwest.post("/usermanage/api/appclient/appUsers/modifyUserInformation", {
                "userUuid": LocalCache.get('userInfo').userUuid,
                "nickname": nickname,
                "password": password,
                "gender": gender,
                "userJob": userJob,
                "userRegion": userRegion,
                "email": email
            }
        )
            .then(function (xhr, res) {
                if (res.code === 0) {
                    // console.log('修改信息：', res)
                    LocalCache.set('userInfo', res.data)
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

    // blur 失去焦点事件
    nickname = () => {
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
                if (res.code == 0 && res.data == 1) {
                    return that.showToastNickname();  // 校验昵称重复提示
                } else {
                    that.modifyUserInformation();
                }

                // if (res.code == 0) {
                //     if (res.data == 1) {
                //         return that.showToastNickname();  // 校验昵称重复提示
                //     } else {
                //         that.modifyUserInformation();
                //     }
                // }
            })
            .catch(function (e, xhr, res) {
                console.error(e);
                console.error(res);
            })
            .complete(function () {
                // console.error("  ======  complete ======= ");
            });

    }
    password = () => {
        this.modifyUserInformation();
    }
    userJob = () => {
        this.modifyUserInformation();
    }
    userRegion = () => {
        this.modifyUserInformation();
    }
    email = () => {
        this.modifyUserInformation();
    }

    // goUploadAvatar = () => {
    //     this.props.history.push({pathname: 'uploadavatar'})
    // }

    UploadAvatar = () => {

    }
    UploadInput = () => {

    }

    Upload = () => {
        let that = this;

        qwest.post("/usermanage/api/appclient/appUsers/modifyUserHeadImg", that.state.param2)
            .then(function (xhr, res) {
                let local = LocalCache.get('userInfo');
                for (let key in local) {
                    local['avatarUrl'] = res.data
                }
                LocalCache.set('userInfo', local);
                that.props.history.push({pathname: 'personaldata'})
            })
            .catch(function (e, xhr, res) {
                console.error(e);
                console.error(res);
            })
            .complete(function () {
                // console.error("  ======  complete ======= ");
            });

    }


    onchange = (file, filesList) => {
        console.log(6666666, file.target.files);
        console.log(667, file);
        // console.log(77777, this.refs.inputFile);

        this.state.param2 = new FormData();
        // this.state.param2.append('headImgfile', file.nativeFile);
        this.state.param2.append('headImgfile', file.target.files[0]);
        this.state.param2.append('unid', LocalCache.get('userInfo').userUuid);
        this.Upload();
    }

    male = () => {
        this.setState({
            male: true,
            gender: 1
        })
        this.modifyUserInformation(1);
    }
    female = () => {
        this.setState({
            female: true,
            gender: 2
        })
        this.modifyUserInformation(2);
    }

    componentWillUnmount() {
        this.state.toastTimerNickname && clearTimeout(this.state.toastTimerNickname);
    }

    componentWillMount() {
        let that = this;
        that.setState({
            userInfo: LocalCache.get('userInfo')
        })
        if (LocalCache.get('userInfo').gender == 1) {
            that.setState({
                male: true,
                female: false
            })
        } else if (LocalCache.get('userInfo').gender == 2) {
            that.setState({
                male: false,
                female: true
            })
        }
    }

    init = () => {
        document.getElementById('nickname').value = LocalCache.get('userInfo').nickname
        document.getElementById('password').value = LocalCache.get('userInfo').password
        document.getElementById('userJob').value = LocalCache.get('userInfo').userJob
        document.getElementById('userRegion').value = LocalCache.get('userInfo').userRegion
        document.getElementById('email').value = LocalCache.get('userInfo').email
    }

    componentDidMount() {
        this.init();
    }

    render() {
        return (
            <div className="personalCont">
                {/* 返回按钮 */}
                <SearchInputView {...this.props}/>
                <Toast icon="warn" show={this.state.showToastNickname}>{"此昵称已经被注册"}</Toast>

                <div className="personal">
                    <div className="cardT">
                        <div className="cardTitle">头像</div>
                        <div onClick={this.goUploadAvatar} className="cardContentA">
                            {/*<div className="cardContentNameOne"></div>*/}
                            <img onClick={this.UploadAvatar} className="cardContentNameOneA"
                                 src={`${LocalCache.get('userInfo').avatarUrl}`}/>
                            <input type="file" accept="image/*" className="inputFileA" onChange={this.onchange}
                                   onClick={this.UploadInput}/>
                            <div className="cardContentImgA"></div>
                            {/*<img className="cardContentImg" src={`${LocalCache.get('userInfo').avatarUrl}`} />*/}
                        </div>
                    </div>
                    <div className="cardT">
                        <div className="cardTitle">昵称</div>
                        <div className="cardContent">
                            {/*<input id="nickname" ref="nickname" className="cardContentName" type="text"*/}
                            {/*       value={`${LocalCache.get('userInfo').nickname}`}*/}
                            {/*       onBlur={this.nickname}></input>*/}
                            <input id="nickname" ref="nickname" className="cardContentName" type="text"
                                   onBlur={this.nickname}></input>
                            <div className="cardContentImg"></div>
                        </div>
                    </div>
                    <div className="cardT">
                        <div className="cardTitle">账号</div>
                        <div className="cardContent">
                            <input className="cardContentName" value={`${LocalCache.get('userInfo').mobilePhone}`}
                                   disabled></input>
                            <div className="cardContentImg"></div>
                        </div>
                    </div>
                    <div className="cardT">
                        <div className="cardTitle">密码</div>
                        <div className="cardContent">
                            <input id="password" ref="password" className="cardContentName" type="number"
                                   onBlur={this.password}></input>
                            <div className="cardContentImg"></div>
                        </div>
                    </div>
                    <div className="cardT" style={{height: '68px'}}>
                        <div className="cardTitle">性别</div>
                        <div className="cardContent">
                            {/*<input className="cardContentName"></input>*/}
                            <Form radio style={{display: 'flex'}}>
                                <FormCell radio onClick={this.male}>
                                    <CellBody>男</CellBody>
                                    <CellFooter>
                                        <Radio name="radio1" value="1" defaultChecked={this.state.male}/>
                                    </CellFooter>
                                </FormCell>
                                <FormCell radio onClick={this.female}>
                                    <CellBody>女</CellBody>
                                    <CellFooter>
                                        <Radio name="radio1" value="2" defaultChecked={this.state.female}/>
                                    </CellFooter>
                                </FormCell>
                            </Form>
                            <div className="cardContentImg"></div>
                        </div>
                    </div>
                    <div className="cardT">
                        <div className="cardTitle">职业</div>
                        <div className="cardContent">
                            <input id="userJob" ref="userJob" className="cardContentName" onBlur={this.userJob}></input>
                            <div className="cardContentImg"></div>
                        </div>
                    </div>
                    <div className="cardT">
                        <div className="cardTitle">所在地区</div>
                        <div className="cardContent">
                            <input id="userRegion" ref="userRegion" className="cardContentName"
                                   onBlur={this.userRegion}></input>
                            <div className="cardContentImg"></div>
                        </div>
                    </div>
                    <div className="cardT">
                        <div className="cardTitle">手机号</div>
                        <div className="cardContent">
                            <input className="cardContentName" value={`${LocalCache.get('userInfo').mobilePhone}`}
                                   disabled></input>
                            <div className="cardContentImg"></div>
                        </div>
                    </div>
                    <div className="cardT">
                        <div className="cardTitle">邮箱</div>
                        <div className="cardContent">
                            <input id="email" ref="email" className="cardContentName" onBlur={this.email}></input>
                            <div className="cardContentImg"></div>
                        </div>
                    </div>

                </div>


            </div>
        );
    }
}

export default PersonalData;