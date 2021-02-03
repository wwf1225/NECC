/**
 * 地图加载失败
 */
import React from 'react';
import './index.less';

 class MapError extends React.Component {
   render() {
     const {onClick} = this.props;

     return(
      <div className="map-err-bd">
        <div className="map-err-icon error-icon"/>
        <div className="map-err-text">地图加载失败，请稍后再试</div>
        <button className="map-err-btn" onClick={onClick}>重新加载</button>
      </div>
     )
   }
 }

 export default MapError;