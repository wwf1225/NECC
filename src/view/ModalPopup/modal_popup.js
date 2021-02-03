
/**
 * 首页的modal_popup框
 */

import React from 'react';
import "./modal_popup.less";
import {getNameByGroupID} from "../../utils/util";
import {Lang,Locale} from "../../utils/translation";


class HomeModalPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {}
  }


  getModalPopup = (data) => {
    this.props.getToModalPopup(data);
  }



  render() {
    const {ModalPopup,getModalMessage} = this.props;

    if (!ModalPopup || !getModalMessage) return null;
    return(
      <React.Fragment>
        <div className="ModalContainer animated faster slideInUp">
          <div>
            <div>
              <img alt="" className='modalPanda' src={require("../../assets/image/icon_panda.png")} />
            </div>
            <div className='copyText'>{Lang.RecentlyCopy}</div>
            <div className='setStyle'>
              <img alt="" className='imageIconTop' src={require("../../assets/image/icon_local.png")} />
              {
                getModalMessage.name ? (
                  <div className='setNameStyle'>
                    {
                      Locale === "en" ? 
                        <div className='postionStyle'>{getModalMessage.ename.replace("%rn%","").replace("%rn%","").replace("%rn%","")} | {getNameByGroupID(getModalMessage.groupID)}</div> : 
                        <div className='postionStyle'>{getModalMessage.name.replace("%rn%","").replace("%rn%","").replace("%rn%","")} | {getNameByGroupID(getModalMessage.groupID)}</div>
                    }
                    <div className='postionMapName'>{Lang.NECC} {getNameByGroupID(getModalMessage.groupID)}</div>
                  </div>
                ) : (
                  <div className='setNameStyle'>
                    <div className='postionStyle'>{Lang.NoPlace}</div>
                    <div className='postionMapName'>{Lang.NECC} {getNameByGroupID(Number(getModalMessage.floor_id))}</div>
                  </div>
                )
              }
            </div>
            <div className='goPosition' onClick={() => this.getModalPopup(getModalMessage)}>
              <img alt="" className='imageIconTop' src={require("../../assets/image/icon_top.png")} />
              <div>{Lang.ClickTo}</div>  
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}



export default HomeModalPage;