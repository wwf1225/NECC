import React from 'react';
import './index.less';
import SearchInputView from "../SearchPage/search_input";



class Qrcode extends React.Component {

  constructor(props){
    super(props)
    this.state ={
    }
  }

  render() {
    return(
      <React.Fragment>
        <SearchInputView {...this.props}/>

        <div className="showQrcode">
          <div className="showTop">【导路者•进博会】</div>
          <div className="logo_imageQrcode">
            <img alt=""  className="logo_qrcode" src={require("../../assets/image/icon_qrcode.png")} />
          </div>
          <div className="content">请长按上方图片保存至手机，使用微信扫一扫识别图中二维码进行下载中国国际进口博览会官方APP畅游进博会。</div>
          <div className="copyText">或者请复制下方链接：</div>
          <div>https://www.ciie.org/zbh/appd/index.html?s=1 </div>
          <div className="textShow">至浏览器下载中国国际进口博览会官方APP畅游进博会。</div>
        </div>
      </React.Fragment>
    )
  }
}

export default Qrcode;