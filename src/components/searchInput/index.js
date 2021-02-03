/**
 * 文本搜索框
 */

import React from 'react';
import "./index.less";
import {Lang, Locale} from "../../utils/translation";
import {isFunction} from "../../utils/util";
import {moveSlideBoardTo} from "../map/touchCard";
import {testParseVoiceId} from "../../api/app";
import qwest from "qwest";
import {AppCode, AppType, MapId} from "../../utils/config";
import LocalCache from "../../utils/storage_cache";
import {Dialog} from 'react-weui';
import 'weui';
import 'react-weui/build/packages/react-weui.css';


const wx = window.wx;

class SearchInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            inputValue: "",
            showZh: false,
            showEn: false,
            style1: {
                buttons: [
                    {
                        label: '取消',
                        onClick: this.hideDialog
                    }
                ]
            },
            style2: {
                buttons: [
                    {
                        label: 'Cancel',
                        onClick: this.hideDialog
                    }
                ]
            },


        }
    }

    hideDialog = () =>{
        this.setState({
            showZh: false,
            showEn: false
        });
    }


    /**
     * 点击回车触发的事件
     */
    handleEnterKey = (e) => {
        if (e.which === 13) {
            const {onSubmit} = this.props;
            isFunction(onSubmit) && onSubmit(this.input.value);
        } else {
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.input.value = nextProps.searchValue;
        this.setState({
            inputValue: nextProps.searchValue
        })
    }


    /**
     * 输入开始时，
     * 输入进行中，
     * 输入完成时
     * 前2个事件都在onChange之前触发，onCompositionEnd是在onChange之后触发。
     */

    handleComposition = (e) => {
        console.log('输入开始===', e);

        if (e.type === 'compositionend') {
            console.error(11111, e);
            this.isIMF = false;
            // chrome浏览器执行的循序不一样，其它浏览器触发两次change event
            this.handleChange(e);
        } else {
            this.isIMF = true
        }
    };

    // 清空
    handleClear = () => {
        this.input.value = '';
        document.activeElement.blur();
        this.props.handleClearEvent();
    };

    // // 输入框改变
    handleChange = (e) => {
        console.log("输入框改变", this.props);
        const {onChange} = this.props;

        // if (!this.isIMF) {
        //     isFunction(onChange) && onChange(e.target.value);
        //     this.isIMF = false;
        // }
    };

    // 获得光标
    handleFocus = () => {
        let self = this;
        // document.activeElement.blur(); //屏蔽默认键盘弹出；
        console.log('获取焦点');
        var u = navigator.userAgent;
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if(isiOS) {
            console.log('获取焦点ios');
            var slideBoard = document.getElementById('slideBoard');
            var inputId = document.getElementById('inputId');
            if (slideBoard) {
                slideBoard.style.top = '5%';
                slideBoard.style.height = '95%';
            }
            self.props.resizeHeight();
            inputId.focus();

        }

    }

    scrollHeight = () => {
        return document.documentElement.scrollTop || document.body.scrollTop || 0;
    }


    handleBlur = () => {
        window.scrollTo(0, Math.max(this.scrollHeight - 1, 0));

    }

    showZhVoice = () => {
        this.props.onVoice();
        this.setState({
            showZh: true
        })
    }

    showEnVoice = () => {
        this.props.onVoice();
        this.setState({
            showEn: true
        })
    }

    render() {
        const {clickVoice, onChange} = this.props;
        return (
            <div className="container">
                {/*<Toast icon="success-no-circle" show={this.state.showToastVoice} className="toastVoice">正在录音</Toast>*/}

               {/* {
                    showToastVoice ? <div icon="success-no-circle" className="toastVoice">录音中...</div> : null
                }*/}


                <div className="searchInputBox">
                    <div className="searchBoxContainer">
                        {/*<div className='search-line'>-</div>*/}
                        <input
                            id="inputId"
                            type="search"
                            className="searchSecond"
                            onKeyPress={this.handleEnterKey}
                            placeholder={`${Lang.SearchDest}`}
                            required
                            ref={(el) => this.input = el}
                            onCompositionStart={this.handleComposition}
                            onCompositionUpdate={this.handleComposition}
                            onCompositionEnd={this.handleComposition}
                            onChange={onChange}
                            onFocus={this.handleFocus}
                            onBlur={this.handleBlur}
                        />
                        {/*<i className="weui-icon-search wicon" style={{position: "absolute", top: "15px", left: "12px", fontSize: "19px", color: "#000"}}/>*/}

                        <div className="wiconFa"><span className="wicon"></span></div>

                        {/*<i className="weui-icon-search"
                           style={{position: "absolute", top: "15px", left: "10px", fontSize: "19px", color: "#000"}}/>*/}

                        {this.state.inputValue !== "" ? <i className="weui-icon-clear" onClick={this.handleClear}
                                                           style={{
                                                               position: "absolute",
                                                               top: "15px",
                                                               right: "38px",
                                                               fontSize: "19px"
                                                           }}/> : null}

                        {/*{this.state.inputValue !== "" ? <img src={require('../../assets/image/n_bar_back@3x.png')} onClick={this.handleClear}
                                                           style={{
                                                               width: "10px",
                                                               height: "18px",
                                                               position: "absolute",
                                                               top: "15px",
                                                               left: "12px",
                                                               fontSize: "19px"
                                                           }}/> : null}*/}

                        {/*{Locale === "en" ? <span className="iconVoice" onTouchStart={this.onDown3} onTouchEnd={this.onUp3}></span> :
                            <span className="iconVoice" onTouchStart={this.onDown2} onTouchEnd={this.onUp2}></span>}*/}

                        {/*{Locale === "en" ? <div className="iconVoiceDiv" onTouchStart={this.onDown3} onTouchEnd={this.onUp3}><span className="iconVoice" ></span></div> :
                            <div className="iconVoiceDiv" onTouchStart={this.onDown2} onTouchEnd={this.onUp2}><span className="iconVoice" ></span></div>}*/}

                        {Locale === "en" ? <div className="iconVoiceDiv" onClick={this.showEnVoice}><span className="iconVoice" ></span></div> :
                            <div className="iconVoiceDiv" onClick={this.showZhVoice}><span className="iconVoice" ></span></div>}

                    </div>

                </div>

            </div>
        )
    }
}

export default SearchInput;