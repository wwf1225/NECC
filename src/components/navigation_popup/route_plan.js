import React from 'react';
import './route_plan.less';
import {Locale,Lang} from "../../utils/translation";
import {getNameByGroupID} from "../../utils/util";
import {Icon,LoadMore} from 'react-weui/build/packages';

class RoutePlatePopup extends React.Component {

    constructor(props) {
        super(props);
        // this.sharePosition = this.sharePosition.bind(this);
        this.state = {}
    }

    sharePosition = () => {
        console.log(33333333,this.props)
        this.props.sharePoiPosition();
    }

    RoutePosition = () => {
        this.props.RoutePosition();
    }

    render() {
        const {visible, onCancel, onConfirm, data, clickMessage, isCollect, showShare, startNav, startRoute ,loading} = this.props;
        const popupData = data || {};
        if (!visible) return null;
        return (
            <div className="containerShow animated faster slideInUp">
                <div className="showButton">
                    {/*<div className="destination">

                        {
                            Locale === "en" ? 
                                (<div>
                                    {
                                        popupData.ename ? 
                                            (<div className="placeName">{(popupData.ename.replace("%rn%","").replace("%rn%","").replace("%rn%","").replace("%20"," ")) + " | " + getNameByGroupID(popupData.groupID)}</div>)
                                            :
                                            (<div className="placeName">{`${Lang.NoPlace} | `+ getNameByGroupID(popupData.groupID)}</div> )
                                    }
                                </div>) : 
                                (<div>
                                    {
                                        popupData.name ? 
                                            (<div className="placeName">{(popupData.name.replace("%rn%","").replace("%rn%","").replace("%rn%","").replace("%20"," ")) + " | " + getNameByGroupID(popupData.groupID)}</div>)
                                            :
                                            (<div className="placeName">{"暂无地点名称 | "+ getNameByGroupID(popupData.groupID)}</div> )
                                    }
                                </div>)
                        }
                        
                        <div className="placePoint">{Lang.NECC} {getNameByGroupID(popupData.groupID)}</div>
                    </div>*/}

                    <div className="destination">

                        {
                            Locale === "en" ?
                                (<div>
                                    {
                                        popupData.ename ?
                                            (<div className="placeName">{(popupData.ename.replace("%rn%","").replace("%rn%","").replace("%rn%","").replace("%20"," "))}</div>)
                                            :
                                            (<div className="placeName">{`${Lang.NoPlace} `}</div> )
                                    }
                                </div>) :
                                (<div>
                                    {
                                        popupData.name ?
                                            (<div className="placeName">{(popupData.name.replace("%rn%","").replace("%rn%","").replace("%rn%","").replace("%20"," "))}</div>)
                                            :
                                            (<div className="placeName">{"暂无地点名称"}</div> )
                                    }
                                </div>)
                        }

                        <div className="placePoint">{getNameByGroupID(popupData.groupID)}</div>
                    </div>

                    <div className="goHere" onClick={onCancel}>
                        {/*<Icon className="cancleIcon" value="clear" />*/}
                        <img className="cancleIcon" src={require("../../assets/image/n_pop_closed@2x.png")} alt=""/>
                    </div>
                </div>

                {/*<div className="lineHeight"></div>*/}

                {
                    loading ? <LoadMore loading>{Lang.NaviPlaning}</LoadMore> :
                    <div>
                    {
                        startNav ? 
                        <div className="LogOutRoute">
                            <div className="showListRoute" onClick={this.RoutePosition}>
                                <img alt="" className="ImageSize" src={require("../../assets/image/icon_detail.png")} />
                                <span className="fontColor">{Lang.RouteDetail}</span>
                            </div>
                            <div className="showListHereOne" onClick={startRoute}>
                                {/*<img alt="" className="ImageSize" src={require("../../assets/image/icon_goHere.png")} />*/}
                                <img alt="" className="ImageSize" src={require("../../assets/image/n_blue_go@2x.png")} />
                                <span className="fontColorHere">{Lang.StartNavigation}</span>
                            </div>
                        </div> :
                        <div className={showShare ? "LogHere" : "LogOut"}>
                            {/*{showShare ? null :
                                <div className="showList" onClick={clickMessage}>
                                    {isCollect? <img alt="" className="ImageSize" src={require("../../assets/image/collection.png")} /> : <img alt="" className="ImageSize" src={require("../../assets/image/no_collection.png")} />}
                                    {isCollect ? <span className="fontColor">{Lang.Collected}</span> : <span className="fontColor">{Lang.AddCollect}</span>}
                                </div>
                            }*/}

                            {showShare ? null :
                                <div className="showListCollect" onClick={clickMessage}>
                                    {isCollect? <span className="ImageSize"></span> : <span className="ImageSize" ></span>}
                                </div>
                            }

                            {showShare ?  null :
                                <div className="showList" onClick={this.sharePosition}>
                                    <img alt="" className="ImageSize" src={require("../../assets/image/share.png")} />
                                    <span className="fontColor">{Lang.ShareMessage}</span>
                                </div>}

                            {/*<div className="showListHereOne" onClick={onConfirm}>
                                <img alt="" className="ImageSize" src={require("../../assets/image/icon_goHere.png")} />
                                <span className="fontColorHere">{Lang.Go}</span>
                            </div>*/}

                            <div className="showListA" onClick={onConfirm}>
                                <img alt="" className="ImageSizeA"
                                     src={require("../../assets/image/n_blue_go@2x.png")}/>
                                <span className="fontColorA">{`${Lang.Go}`}</span>
                            </div>
                        </div>
                    }
                    </div>
                }
            </div>
        );
    };
}

export default RoutePlatePopup;
