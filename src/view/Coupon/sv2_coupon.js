import React from 'react';
import './sv2_coupon.less'

import { IoIosArrowDown } from "react-icons/io";

// https://github.com/react-icons/react-icons
export default class Coupon extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        // const {} = this.state;
        // const {} = this.props;
        return (
            <div className="cc-cell">
                <div className="cc-cell-body">
                    <div className="cc-cell-body-div-icon">
                        <img src={'http://q5vo93y3a.bkt.clouddn.com/e9e8979c1e773cf7f183fb7b94f30619.png'} className="cc-cell-body-div-icon-img"/>
                    </div>
                    <div className="cc-cell-body-div-content">
                        <div className="cc-cell-body-div-content-title">
                                <span className="cc-cell-body-div-content-title-image">优惠券</span>
                                <span className="cc-cell-body-div-content-title-text">化妆露无门槛10元券</span>
                        </div>
                        <div className="cc-cell-body-div-content-time">

                            <span className="cc-cell-body-div-content-time-text">2020年02月18日</span>
                            <a className="cc-cell-body-div-content-time-button">立即使用</a>
                        </div>
                    </div>
                </div>
                <div className="cc-cell-footer">

                    <span className="cc-cell-footer-text">仅限到门店使用(查看详情)</span>

                    <div className="cc-cell-footer-div-img">
                        <IoIosArrowDown style={{color:'gray'}} />
                    </div>


                </div>
            </div>
        );
    }

}
