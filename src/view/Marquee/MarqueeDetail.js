import React, {Component} from 'react';
import SearchInputView from "../SearchPage/search_input";
import qwest from "qwest";
import LocalCache from "../../utils/storage_cache";
import style from './MarqueeDetail.module.less'
import {Lang, Locale} from "../../utils/translation";
import Toast from "react-weui/build/packages/components/toast";

class MarqueeDetail extends Component {
    constructor() {
        super();
        this.state = {
            detailArticle: '',
            detailArticleEnglish: '',
            isShowLoading: true
        }
    }

    // 获取通知列表详情页
    getMarqueeListDetail = () => {
        let that = this;
        let nmuuid = LocalCache.get("nmuuid");
        qwest.post("/manage/api/appclient/noticemessage/clientGetNoticeMessageDetailArticle", {
                "nmuuid": nmuuid
            }
        )
            .then(function (xhr, res) {
                if (res.code == 0) {
                    console.log('消息列表详情：', res);
                    that.setState({
                        detailArticle: res.data.detailArticleZh,
                        detailArticleEnglish: res.data.detailArticleEn,
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

    init = () => {
        document.getElementById('articleContet').innerHTML = this.state.detailArticle;
    }
    initEN = () => {
        document.getElementById('articleContetEn').innerHTML = this.state.detailArticleEnglish;
    }

    componentWillMount() {
        this.getMarqueeListDetail();
    }

    componentDidMount() {

        let that = this;
        setTimeout(() => {
            that.setState({
                isShowLoading: false
            })
        },600)

        if(document.getElementById('articleContet') == '' || document.getElementById('articleContet') == undefined) {
            setTimeout(() => {
                that.initEN();
            },600)
        }else {
            setTimeout(() => {
                that.init();
            },600)
        }

    }

    handleBack = () => {
        this.props.history.push({pathname: 'marqueelist'});
    }

    render() {
        return (
            <div className={style.contain}>
                {/* 返回按钮 */}
                {/*<SearchInputView {...this.props}/>*/}

                <div className={style.search_input_bd}>
                    <div id="back" className={style.search_input_back} onClick={this.handleBack}/>
                </div>
                {/*<div id="articleContet" className={style.articleContet}></div>*/}
                {Locale === "en" ? <div id="articleContetEn" className={style.articleContet}></div> : <div id="articleContet" className={style.articleContet}></div>}
                <Toast icon="loading" show={this.state.isShowLoading}>{Lang.Loading}</Toast>
            </div>
        );
    }
}

export default MarqueeDetail;