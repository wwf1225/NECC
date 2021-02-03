import React from 'react';
import './index.less';
import {MapId, AppCode, AppType} from "../../utils/config";
import {HomeNotifityMessage} from "../../api/app";
import {Locale,Lang} from "../../utils/translation";
import {notify} from '../../components/notify_toast/notify';
import LocalCache from "../../utils/storage_cache";

class Marquee extends React.Component {
  constructor(props){
    super(props)
    this.state ={
      visable: true,
      notifyList: [],
      showDialogDetail: false
    }
  }


  componentDidMount() {
    console.log("已经执行了");
    var that = this;
    var paramsObj = {
      venueuuid: MapId,
      appcode: AppCode,
      // codeType: "2",
      unid: LocalCache.get("openID"),
      apptype: AppType,
      important: 1
    }

    HomeNotifityMessage(paramsObj).then((res) => {
      console.log('HomeNotifityMessage=======',res);
      // if(res.code !== 0){
      //   // notify.show(`${Lang.TimeOut}`, 'error');
      // }else{
      //   that.setState({
      //     notifyList: res.data
      //   })
      // }
      if(res.code == 0) {
          that.setState({
            notifyList: res.data
          })
      } else {
        // notify.show(`${Lang.TimeOut}`, 'error');
      }
    })

    this.props.onRef(this)
  }

  closeDialog = (e) => {
    e.stopPropagation();
    this.setState({
      visable: false,
      showDialogDetail: false
    })
  }

  getNotifyDetail(nmuuid) {
    console.log(3333333333,nmuuid)
    LocalCache.set("nmuuid",nmuuid);
    this.props.history.push({pathname:'marqueedetail'});
  }

  closeDetail = () => {
    this.setState({
      showDialogDetail: false
    })
  }

  showDetail = () => {
    return(
      <div className="showDetailInfo animated zoomIn">
        <ul>
          {
            this.state.notifyList.map((item,index) => {
              return (
                <li key={index} className="showDetailInfoLi">
                  {
                    Locale === "en" ? (
                      <div>
                        <div className="detailTitle">{item.entitle}</div>
                        <div className="detailMessage">{item.enNoticeMessage}</div>
                      </div>
                    ): (
                      <div>
                        <div className="detailTitle">{item.title}</div>
                        <div className="detailMessage">{item.noticeMessage}</div>
                      </div>
                    )
                  }
                </li>
              )
            })
          }
        </ul>
        {/* <i className="weui-icon-clear" onClick={this.closeDetail} style={{position:"absolute",top:"-6px",right:"-8px"}} /> */}
      </div>
    )
  }

  render() {
    const {notifyList,visable,showDialogDetail} = this.state;
    const {permisionList} = this.props;
    if(!visable) return null;
    return (
      <React.Fragment>
        {
          permisionList.length !== 0 && permisionList.indexOf("info_msg") >= 0 ?
          (
            notifyList && notifyList.length === 0 ? null :
            (
              <div className="container_marqu">
                <div className="container_logo">
                  <div className="container_img"/>
                  {Locale === "en" ? <div className="container_logo_mark">{'Naviguy :'}</div> : <div className="container_logo_mark">{'导路者提示：'}</div>}
                </div>

                <div className="container_text">
                  {
                    notifyList.map((item,index) => {
                      return(
                          <div className="notify_title" key={index} onClick={() => {this.getNotifyDetail(item.nmuuid)}}>
                          {
                            Locale === "en" ? (item.entitle) : (item.title)
                          }
                        </div>
                      )
                    })
                  }
                </div>
                {/*<i className="weui-icon-clear" onClick={this.closeDialog} style={{position:"absolute",top:"0px",right:"0px",fontSize:"19px",width:"30px",height: "30px",background: "#fff",lineHeight:"30px"}} />*/}
                <img src={require('../../assets/image/n_pop_closed@2x.png')} onClick={this.closeDialog} style={{position:"absolute",top:"0px",right:"0px",fontSize:"19px",width:"30px",height: "30px",background: "#fff",lineHeight:"30px",marginRight: "5px"}} />
              </div>
            )
          ): null
        }


         {/*{showDialogDetail ? this.showDetail() : null}*/}
      </React.Fragment>
    );
  }
}

export default Marquee;
