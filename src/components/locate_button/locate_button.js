import React from 'react';
import style from './locate_button.module.less';

class LocateButton extends React.Component {


    constructor(props) {
        super(props);
        this.data = null;
    }
    
    walkChangeStatus = () =>{
        const {walkChange,getOtherChange,getChangeMapPosition,onClick} = this.props;
        if (walkChange === 1){
            return (<div className={style.container} onClick={onClick} />);
        }else if (walkChange === 2){
            return (
                   <div className={style.touchImage} onClick={getChangeMapPosition}></div>
                    // <div className={style.touchImage} onClick={getChangeMapPosition}>
                    //     <img alt="" className={style.touchImageSize} src={require("../../assets/image/btn_navigation.png")} />
                    // </div>
                );
        }else{
            return (
                    <div className={style.compassImage} onClick={getOtherChange} />
                    // <div className={style.compassImage} onClick={getOtherChange}>
                    //     <img alt="" className={style.compassImageSize} src={require("../../assets/image/btn_navigation_2@2x.png")} />
                    // </div>
                );
        }
    }

    render() {
        const {visible} = this.props;

        if (!visible) return null;

        return (
            <React.Fragment>
            {this.walkChangeStatus()} 
            </React.Fragment>
            // <div className={ changeImage ? style.touchImage : style.container} onTouchStart={(e) => this.gtouchstart(e)} onTouchEnd={(e) => this.gtouchend(e)}/>
        );
    }
}

export default LocateButton;
