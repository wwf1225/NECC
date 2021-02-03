import React from 'react';
import './index.less';
import {isArray, isFunction} from "../../utils/util";

class SwitchFloor extends React.Component {
    state = {
        isShowList: false,
        currentGID: null,
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        let nextGID = nextProps.currentFloor;
        if (this.state.currentGID === null && nextGID) {
            this.setState({currentGID: nextGID});
        }
    }

    // 切换楼层
    changeFloor = (floor) => {
        const {onChange} = this.props;
        isFunction(onChange) && onChange(floor, true);
    };
    // 禁止click事件传递
    handleClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
    };
    // 显示楼层列表
    showFloorList = () => {
        const {isShowList} = this.state;
        this.setState({isShowList: !isShowList});
    };
    // 更新楼层文字
    updateFloorText = (gid) => {
        this.setState({
            currentGID: gid,
            isShowList: false
        });
    };

    render() {
        const {style, className, floors} = this.props;
        const {isShowList, currentGID} = this.state;

        // 当前楼层的楼层名称
        const currentFloorName = getFloorName(currentGID);

        return (
            currentGID
                ? ( <div
                    style={style}
                    className={'swt-floor-bd grey-sm' + (className ? ` ${className}` : '')}
                    onClick={this.handleClick}
                >
                    <div className="swt-floor-cur" onClick={this.showFloorList}>
                        {currentFloorName === null
                            ? (<WalkIcon active={true}/>)
                            : (<span className="cyan-sm">{currentFloorName}</span>)
                        }
                    </div>
                    {isArray(floors) && isShowList
                        ? ( <div className="swt-floor-list animated faster zoomIn">
                            {floors.map((f) => { //eslint-disable-line
                                if(f !== 1){
                                    let FName = getFloorName(f);
                                    return (
                                        <div
                                            className="swt-floor-list_item"
                                            key={f}
                                            onClick={(e) => this.changeFloor(f, e)}
                                        >
                                            {FName === null
                                                ? <WalkIcon active={f === currentGID}/>
                                                : (<span className={f === currentGID ? 'cyan-sm' : ''}>{FName}</span>)
                                            }
                                        </div>
                                    );
                                }
                            })}
                        </div>)
                        : null
                    }
                </div>)
                : null
        );
    }
}

function getFloorName(floorID) {
    switch (floorID) {
        case 1:
            return 'B1';
        case 2:
            return 'F1';
        case 3: // 行走图标
            return "F2";
        case 4:
            return 'F3';
        default:
            return `${floorID}F`;
    }
}

function WalkIcon(props) {
    const isActive = props.active;

    return (<div className={'swt-floor-icon' + (isActive ? ' active' : '')}/>);
}

export default SwitchFloor;