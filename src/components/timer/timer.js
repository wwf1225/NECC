import React, {Component} from 'react';
import {
    Button
} from 'antd-mobile';

class Timer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            count: 60,
            liked: true,
        };

    }
    componentDidMount(){
        // console.log(121212,this.props)
        // console.log(1333333,this.props.countDownFlag.refs.inputVal)
        this.props.onRef(this)
    }
    countDown() {
        // 输入有效的手机号码才开始倒计时
        if(this.props.countDownFlag.refs.inputVal.value == undefined || this.props.countDownFlag.refs.inputVal.value == '') {
            return
        }
        var phone = this.props.countDownFlag.refs.inputVal.value;
        // console.error(this.props);
        // console.error(this.props.countDownFlag.refs.inputVal.value);

        if (phone && /^1[3|4|5|8]\d{9}$/.test(phone)) {
            const {count} = this.state;
            if (count === 1) {
                this.setState({
                    count: 60,
                    liked: true,
                });
            } else {
                this.setState({
                    count: count - 1,
                    liked: false,
                });
                setTimeout(this.countDown.bind(this), 1000);
            }
        }

        // const {count} = this.state;
        // if (count === 1) {
        //     this.setState({
        //         count: 60,
        //         liked: true,
        //     });
        // } else {
        //     this.setState({
        //         count: count - 1,
        //         liked: false,
        //     });
        //     setTimeout(this.countDown.bind(this), 1000);
        // }
    }

    handleClick = () => {
        const {sendMsg} = this.props;
        const {liked} = this.state;
        if (!liked) {
            return;
        }
        this.countDown();
    };

    render() {
        return (

            // <Button onClick={() => this.handleClick()} type="primary">
            //     {
            //         this.state.liked
            //             ? '获取验证码'
            //             : `${this.state.count} s`
            //     }
            // </Button>
            <span onClick={() => this.handleClick()}>
                {
                    this.state.liked
                        ? '获取验证码'
                        : `${this.state.count} s`
                }
            </span>

        )

    }
}


export default Timer;
