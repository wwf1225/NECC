import React from 'react';
import './sv3_business.less'

import {IoIosStar} from "react-icons/io";
export default class Business extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // const {} = this.state;
        // const {} = this.props;
        return (
            <div className="bc-cell">
                    <img  className="bc-cell-image" src={'http://q5vo93y3a.bkt.clouddn.com/b23b64972848865583b312138afa6c9d.png'}/>

                    <div className="bc-cell-contain">
                        <div  className="bc-cell-contain-title">麦当劳连锁店（国展店）</div>
                        <div  className="bc-cell-contain-star">
                            <span style={{color:'#F84A06'}}><IoIosStar style={{'color':'#F84A06'}}/> 4.7</span>
                            <span className="bc-cell-contain-star-count">月销量781份</span>
                            <div className="bc-cell-contain-star-flag">蜂鸟专送</div>
                        </div>
                        <div  className="bc-cell-contain-price">
                            <span className="bc-cell-contain-star-count">起送¥15元 配送费¥3元</span>
                            <span className="bc-cell-contain-star-count bc-cell-float-right">40分钟 5km</span>

                        </div>
                    </div>
                    <div className="bc-cell-tail" >详情</div>
            </div>
        );
    }

}
