import React, {Component} from 'react';
import {Button, Uploader} from "react-weui";
import LocalCache from "../../utils/storage_cache";
import qwest from "qwest";
import SearchInputView from "../SearchPage/search_input";
import style from './uploadAvatar.module.less';



class UploadAvatar extends Component {
    constructor() {
        super();
        this.state = {
            param2: {},
        }
    }

    onchange = (file, filesList) => {
        console.log(6666666, file.target.files);
        console.log(667, file);
        // console.log(77777, this.refs.inputFile);

        this.state.param2 = new FormData();
        // this.state.param2.append('headImgfile', file.nativeFile);
        this.state.param2.append('headImgfile', file.target.files[0]);
        this.state.param2.append('unid', LocalCache.get('userInfo').userUuid);
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

    render() {
        const { files } = this.state;
        return (
            <div>
                {/* 返回 */}
                <SearchInputView {...this.props}/>

                <div className={style.cont}>
                    {/*<Uploader*/}
                    {/*    className={style.upload}*/}
                    {/*    maxCount={2}*/}
                    {/*    onChange={this.onchange}*/}
                    {/*/>*/}


                    <input type="file" accept="image/*"  ref="inputFile" onChange={this.onchange}/>
                    {/*<input id="uploaderCustomInput" className="weui-uploader__input" type="file" accept="image/*"*/}
                    {/*       multiple="" onChange={this.onchange} />*/}

                </div>

                <Button style={{'background': '#2E9FFB'}} onClick={this.Upload}>上传头像</Button>
            </div>
        );
    }
}

export default UploadAvatar;