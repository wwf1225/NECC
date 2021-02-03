import React from 'react';
import './index.less';
import {Locale} from "../../utils/translation";
import SearchInputView from "../SearchPage/search_input";



class NotifyDetail extends React.Component {

  constructor(props){
    super(props)
    this.state ={
      notifyMessage: props.location.state.notifyList
    }
  }

  componentDidMount() {
    console.log(this.state.notifyMessage);
  }



  render() {
    return(
      <React.Fragment>
        <SearchInputView {...this.props}/>

        <div className="notifyMessageContain">
          <ul>
            {
              this.state.notifyMessage.map((item,index) => {
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
        </div>
      </React.Fragment>
    )
  }
}

export default NotifyDetail;