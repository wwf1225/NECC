import React from 'react';
import style from './navigation.module.less';

class NavigationPopup extends React.Component {
    render() {
        const {visible, onClick, navigation} = this.props;

        if (!visible) return null;

        const naviData = navigation || {};
        const floor = naviData.floor || {};

        return (
            <React.Fragment>
                <div className={style.topBox}>
                    <div className={style.naviDescBox}>{naviData.naviText}</div>
                    <div className={style.naviDescBox}>{naviData.naviShow}</div>
                    <div className={style.destDescBox}>
                        <div className={style.currentPlace}>当前位置：{floor}</div>
                        <div className={style.destinationPlace}>目的地：{naviData.destName}</div>
                    </div>
                </div>
                <div className={style.container} onClick={onClick}>结束导航</div>
            </React.Fragment>
        );
    }
}

export default NavigationPopup;
