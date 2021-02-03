import React from 'react';
import "./index.less";
import {Lang} from "../../utils/translation";

class emptyMessage extends React.Component {


    render() {

        const {onClick} = this.props;

        return (
            <div className="emptyContainer">
              {/*<img alt="" className="emptyIcon" src={require("../../assets/image/icon_empty.png")} />*/}
              <img alt="" className="emptyIcon" src={require("../../assets/image/n_delete_defimg@2x.png")} />
              <div className="textStyle">{Lang.CollectEmpty}</div>
              <button onClick={onClick}>{Lang.GoShopping}</button>
            </div>
        );
    }
}

export default emptyMessage;