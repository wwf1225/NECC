// import $ from 'jquery'
//
//
// // var countClick = 0; //按钮点击次数 显示隐藏面板
// var initRate = 0.75; // 滑动面板初始显示比例
// var mobileOldY = 0; //手机端记录初始点击y轴的值
// var moblieTop = 0; //记录初始点击时滑板的top值
// var mobileOldTIME = new Date().getTime();//记录初始点的时间
//
//
//
// var slideBoard = null;
// var moveFlag = true;
// export let sliderHeight = null;
// var END_CALLBACK = null;
//
//
// /**
//  * 初始化 slide
//  */
// export function initSlideBoard(slideObj) {
//     slideBoard = slideObj;
//     slideBoard.style.top = Math.ceil($(window).height() * initRate) + "px";
//     slideBoard.style.height = Math.ceil($(window).height() * (1 - initRate)) + "px";
//     // 参考文档 https://blog.csdn.net/lijingshan34/article/details/88350456
//     // document.addEventListener('touchstart', touchStart, { passive: false });
//     document.addEventListener('touchstart', touchStart, {passive: false});
// }
//
// //当点击快捷搜索，禁止滑动面板滑动
// export function moveFlagTouch(e) {
//     moveFlag = e;
// }
//
// // export function sliderHeightTouch(e) {
// //
// // }
//
// //滑动开始事件  mobile
// function touchStart(e) {
//     // console.log('touchStart',e)
//
//     if (e.touches[0].clientY >= parseInt(slideBoard.style.top)) {
//         mobileOldY = e.touches[0].clientY;
//         moblieTop = parseInt(slideBoard.style.top);
//         mobileOldTIME = new Date().getTime();
//
//         document.addEventListener('touchmove', touchMove, {passive: false});
//         document.addEventListener('touchend', touchEnd, {passive: false});
//     }
//
// }
//
// function touchMove(e) {
//     // console.log('touchMove',e);
//     // e.preventDefault(); // 会导致弹出层pop无法滑动
//
//     // var y = e.touches[0].clientY - mobileOldY;
//     // slideBoard.style.top = moblieTop + y + "px";
//     // slideBoard.style.height = $(window).height() - y - moblieTop + "px";
//     // if (parseInt(slideBoard.style.top) < 0) {
//     //     slideBoard.style.top = 0;
//     // }
//     // if (parseInt(slideBoard.style.top) > Math.ceil($(window).height()
//     //     * initRate)) {
//     //     slideBoard.style.top = Math.ceil($(window).height() * initRate) + "px";
//     //     slideBoard.style.height = Math.ceil($(window).height() * (1 - initRate)) + "px";
//     // }
//
//
//     if (moveFlag) {
//         // 当接近屏幕顶端25px时候禁止上滑
//         // let heightStartTop = slideBoard.style.top.substring(0, slideBoard.style.top.length - 2);
//
//         if (parseInt(slideBoard.style.top) > 25) {
//             // console.log('touchMove');
//             var y = e.touches[0].clientY - mobileOldY;
//             slideBoard.style.top = moblieTop + y + "px";
//             slideBoard.style.height = $(window).height() - y - moblieTop + "px";
//             if (parseInt(slideBoard.style.top) < 0) {
//                 slideBoard.style.top = 0;
//             }
//             if (parseInt(slideBoard.style.top) > Math.ceil($(window).height()
//                 * initRate)) {
//                 slideBoard.style.top = Math.ceil($(window).height() * initRate) + "px";
//                 slideBoard.style.height = Math.ceil($(window).height() * (1 - initRate)) + "px";
//             }
//
//         }
//
//     }
//
//
// }
//
// export function touchEnd(e, callback) {
//     END_CALLBACK = typeof callback == "function" ? callback : null;
//     console.log("call touchend", END_CALLBACK);
//     console.log('touchEnd',e)
//     document.removeEventListener('touchmove', touchMove, {passive: false});
//     document.removeEventListener('touchend', touchEnd, {passive: false});
//
//     // var dist = mobileOldY - e.changedTouches[0].clientY;
//     // var time = new Date().getTime() - mobileOldTIME;
//     // if (dist / time > 0.5) {
//     //     moveSlideBoardTo(2);
//     //     return;
//     // }
//     // if (dist / time < -0.5) {
//     //     moveSlideBoardTo(0);
//     //     return;
//     // }
//     // 0.1  0.5  0.75
//     if (parseInt(slideBoard.style.top) < Math.ceil($(window).height() * 0.15)) {
//         moveSlideBoardTo(3);
//
//         sliderHeight = "ALL";
//         if (END_CALLBACK !== null) {
//             END_CALLBACK(e,sliderHeight);
//             END_CALLBACK = null;
//         }
//
//
//     } else if (parseInt(slideBoard.style.top) < Math.ceil($(window).height() * 0.5)) {
//         moveSlideBoardTo(2);
//
//         sliderHeight = "HALF";
//         if (END_CALLBACK !== null) {
//             END_CALLBACK(e,sliderHeight);
//             END_CALLBACK = null;
//         }
//
//     } else if (parseInt(slideBoard.style.top) > Math.ceil($(window).height() * 0.72)) {
//         moveSlideBoardTo(1);
//
//         sliderHeight = "INIT";
//         if (END_CALLBACK !== null) {
//             END_CALLBACK(e,sliderHeight);
//             END_CALLBACK = null;
//         }
//     }
//     console.log(sliderHeight)
//
// }
//
//
// var loopCount = 0;
// var loopID;
//
// //移动滑板到某位置  mobile PC
// export function moveSlideBoardTo(location) {
//     // console.log('location00:',location)
//     var moveTime = 100;
//     // var moveIntervalTime = 10;
//     var moveIntervalTime = 100;
//     var locationRate = 1;
//     var rate = moveTime / moveIntervalTime;
//     loopCount = 0;
//
//     if (location == 1) {
//         locationRate = 0.25;
//     } else if (location == 2) {
//         locationRate = 0.55;
//     } else if (location == 3) {
//         // locationRate = 0.85;
//         locationRate = 0.95;
//         // locationRate = 0.9;
//     }
//
//     if (Math.ceil((1 - locationRate) * $(window).height()) == parseInt(slideBoard.style.top)) {
//         return;
//     } else if (Math.ceil((1 - locationRate) * $(window).height()) < parseInt(slideBoard.style.top)) {//需要上升
//         var dist = parseInt(slideBoard.style.top) - (1 - locationRate) * $(window).height();
//         var perdist = Math.ceil(dist / rate);
//         // loopID = setInterval("moveUp(" + perdist + "," + rate + "," + locationRate + ")", moveIntervalTime);
//         // loopID = setInterval(moveUp(perdist, rate, locationRate), moveIntervalTime);
//
//         loopID = setInterval(() => {
//             moveUp(perdist, rate, locationRate)
//         }, moveIntervalTime);
//
//     } else {//下降
//         var dist = (1 - locationRate) * $(window).height() - parseInt(slideBoard.style.top);
//         var perdist = Math.ceil(dist / rate);
//         // loopID = setInterval("moveDown(" + perdist + "," + rate + "," + locationRate + ")", moveIntervalTime);
//         // loopID = setInterval(moveDown(perdist, rate, locationRate), moveIntervalTime);
//
//         loopID = setInterval(() => {
//             moveDown(perdist, rate, locationRate)
//         }, moveIntervalTime);
//
//     }
//
//
// }
//
// //上移函数
// function moveUp(perdist, rate, locationRate) {
//     // console.log('moveUp')
//     // console.log('up:', perdist, rate, locationRate)
//     if (loopCount != rate) {
//         slideBoard.style.top = parseInt(slideBoard.style.top) - perdist + "px";
//         slideBoard.style.height = $(window).height() - parseInt(slideBoard.style.top) + "px";
//         loopCount = loopCount + 1;
//
//     } else {
//         slideBoard.style.top = Math.ceil((1 - locationRate) * $(window).height()) + "px";
//         slideBoard.style.height = $(window).height() - parseInt(slideBoard.style.top) + "px";
//         clearInterval(loopID);
//     }
// }
//
// //下移函数
// function moveDown(perdist, rate, locationRate) {
//     // console.log('moveDown')
//     // console.log('moveDown:', perdist, rate, locationRate)
//     if (loopCount != rate) {
//         slideBoard.style.top = parseInt(slideBoard.style.top) + perdist + "px";
//         slideBoard.style.height = $(window).height() - parseInt(slideBoard.style.top) + "px";
//         loopCount = loopCount + 1;
//         // console.log('slideBoard.style.top:',slideBoard.style.top)
//         // console.log('slideBoard.style.height:',slideBoard.style.height)
//     } else {
//         slideBoard.style.top = Math.ceil((1 - locationRate) * $(window).height()) + "px";
//         slideBoard.style.height = $(window).height() - parseInt(slideBoard.style.top) + "px";
//
//         // slideBoard.hisTop = Math.ceil((1 - locationRate) * $(window).height());
//         // slideBoard.hisHeight = $(window).height() - parseInt(slideBoard.style.top);
//         clearInterval(loopID);
//     }
// }
//
