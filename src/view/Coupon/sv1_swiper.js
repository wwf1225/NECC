import React from 'react';
import './sv1_swiper.less'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// https://github.com/akiran/react-slick
export default class SubViewSwiper extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const settings = {
            dots: false,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay:true,
            arrows:false,
        };
        const {imgList,onImageClick} = this.props;
        return (
            <div className="divstyle">
                <Slider {...settings} >
                    {
                        imgList.map(function (v,i) {
                           return( <div className="divstyle" onClick={()=>{
                                    onImageClick(v)
                           }} >
                                <img className="divstImg" src={v} />
                            </div>);
                        })
                    }
                </Slider>
            </div>
        );
    }

}
