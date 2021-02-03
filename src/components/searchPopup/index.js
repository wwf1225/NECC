/**
 * 查询的popup框
 */
import './index.less';
import React from 'react';
import {Popup} from 'react-weui/build/packages';
import {getNameByGroupID} from "../../utils/util";
import {Lang} from "../../utils/translation";
import {Locale} from "../../utils/translation";

class SearchPopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // currentIndex: null,  //设置选中单条li的样式
            dataList: props.searchList,
            currentIndex: 0
        }
    }

    //当组件接收到新的props时
    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({dataList: nextProps.searchList});
    }

    //点击单个item信息
    setCurrentIndex = (event, item, index) => {
        console.log(1212,event,item,index);

        // let status = false;
        // this.props.status(status);
        this.props.OjectMessage(event, item);
        this.setState({
            currentIndex: (index + 1)
        })

        // var slideBoard = document.getElementById('slideBoard');
        // if (slideBoard) {
        //     slideBoard.style.top = '45%';
        //     slideBoard.style.height = '55%';
        // }

        document.body.scrollTop = 0;
    }

    goCurrentHere = (event, item, index) => {
        // let status = false;
        // this.props.status(status);
        this.props.willThereMessage(event, item);
        this.props.goCurrentHere();
    }

    render() {
        const {visible, onClickPopup, showRouteStyle, permisionList,goCurrentHere} = this.props;
        if (!visible) return null;
        return (
            <Popup
                show={visible}>
                <div className={showRouteStyle ? "popDown" : "popMessage"}>
                    <ul>
                        {this.state.dataList && this.state.dataList.map((item, index) => {
                            return (
                                <li className={this.state.currentIndex === (index + 1) ? "borderIndexLi" : "borderBackgroundLi"}
                                    key={index}
                                    onClick={(event) => this.setCurrentIndex(event, item, index)}>
                                    <div className="singleItem">
                                        <div className="singleName">
                                            {/*<div className={this.state.currentIndex === (index + 1) ? "borderIndex" : "borderBackground"}>{index + 1}</div>*/}
                                            <div className={this.state.currentIndex === (index + 1) ? "borderIndex" : "borderBackground"}>{index + 1}{'.'}</div>
                                            <div className="distance">
                                                {
                                                    Locale === "en" ? (<div
                                                        className="distanceName">{item.ename === null ? "" : item.ename.replace("%rn%", "").replace("%rn%", "").replace("%rn%", "")}</div>) : (
                                                        <div
                                                            className="distanceName">{item.name === null ? "" : item.name.replace("%rn%", "").replace("%rn%", "").replace("%rn%", "")}</div>)
                                                }
                                                <div className="distanceFloor">{getNameByGroupID(item.groupID)}</div>
                                            </div>
                                        </div>
                                        {/*{
                                          permisionList.length !== 0 && permisionList.indexOf("popview_go") >= 0 ?
                                          (
                                            <div className="goThere" onClick={(event) => this.goCurrentHere(event,item,index)}>
                                              <img alt="" className="showImg" src={require("../../assets/image/n_blue_go@2x.png")} />
                                              <img alt="" className="showImg" src={require("../../assets/image/go_here.png")} />
                                              <div className="textHere">{Lang.GoThere}</div>
                                            </div>
                                          ): null
                                        }*/}


                                        <div className="goThere"
                                             onClick={(event) => this.goCurrentHere(event, item, index)}>
                                            <img alt="" className="showImg"
                                                 src={require("../../assets/image/n_blue_go@2x.png")}/>
                                        </div>

                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                    {this.state.dataList.length === 0 ? <div className="footerNo">{Lang.NotSearchResult}</div> :
                        <div className="footer">{Lang.AllSearchMessage}</div>}
                    <i className="weui-icon-clear" onClick={onClickPopup}
                       style={{position: "absolute", top: "4px", right: "0px", fontSize: "19px"}}/>
                </div>
            </Popup>
        )
    }
}

export default SearchPopup;

