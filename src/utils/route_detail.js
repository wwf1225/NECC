/**
 * 路线详情的界面数据
 */

import {Lang} from "./translation";
import {getNameByGroupID,precise} from "./util";

 //data是传入过来的导航对象
export function getRouteDetailLine(data) {

  let result = [];

  if (data) {
      let descriptions = data.naviDescriptionsData;

      console.log(descriptions);

      descriptions.forEach((item, index) => {
          let text = '';
          let icon = '';

          if (index === 0) {
              result.push({
                  key: 'start_point',
                  icon: 'direction-start',
                  html: `<span class="grey-m">${Lang.MyPosition}</span> ${getStartDirectName(item.startDirection)}`
              });
          }

          if (item.startGID !== item.endGID) {
              icon = 'direction-elevator';
              text += `${Lang.NaviElevator} <span class="grey-m">${getStartDirectName(item.startDirection)}</span> ${Lang.Arrival} <span class="grey-m">${getNameByGroupID(item.endGID)} ${Lang.Floor}</span>`;

              if (item.endDirection === '终') {
                  result.push({
                      key: 'the_end_point',
                      icon: icon,
                      html: text
                  });
                  icon = 'direction-end';
                  text = `${Lang.ArriveDest}`;
              }

          } else {
              text = `${getStartDirectName(item.startDirection)} <span class="grey-m">${precise(item.distance, 1)}${Lang.Meter}</span> `;
              // startDirection ["北", "东北", "东", "东南", "南", "西南", "西", "西北", "北"]
              // endDirection ["前", "右前", "右", "右后", "后", "左后", "左", "左前", "前"]
              // endDirection描述 ["继续直行", "右前方继续直行", "右转", "右后转", "后退", "左后转", "左转", "左前方继续直行", "继续直行"]
              switch (item.endDirection) {
                  case `${Lang.front}`:
                      icon = 'direction-straight';
                      text += `${Lang.Straight}`;
                      break;
                  case `${Lang.Up}`:
                      icon = 'direction-elevator';
                      text += `${Lang.NaviElevator} <span class="grey-m">${Lang.NaviUp}</span>`;
                      break;
                  case `${Lang.Down}`:
                      icon = 'direction-elevator';
                      text += `${Lang.NaviElevator} <span class="grey-m">${Lang.NaviDown}</span>`;
                      break;
                  case `${Lang.right}`:
                      icon = 'direction-right';
                      text += `${Lang.TurnRight}`;
                      break;
                  case `${Lang.rightFront}`:
                      icon = 'direction-rightfront';
                      text += `${Lang.RightFront}`;
                      break;
                  case `${Lang.rightFrontAround}`:
                      icon = 'direction-rightfront';
                      text += `${Lang.RightFront}`;
                      break;
                  case `${Lang.TurnAroundRight}`:
                      icon = 'direction-turnaround';
                      text += `${Lang.TurnAround}`;
                      break;
                  case `${Lang.left}`:
                      icon = 'direction-left';
                      text += `${Lang.TurnLeft}`;
                      break;
                  case `${Lang.leftFront}`:
                      icon = 'direction-leftfront';
                      text += `${Lang.LeftFront}`;
                      break;
                  case `${Lang.leftFrontAround}`:
                      icon = 'direction-leftfront';
                      text += `${Lang.LeftFront}`;
                      break;
                  case '终':
                      icon = 'direction-end';
                      text += `${Lang.ArriveDest}`;
                      break;
                  default:
              }
          }

          result.push({
              key: `${item.startIndex}_${item.endIndex}_${index}`,
              html: text,
              icon: icon,
          });
      });
  }

  return result;
}

//获取方向的翻译
function getStartDirectName(direct) {
  // ["北", "东北", "东", "东南", "南", "西南", "西", "西北", "上", "下"]
  switch (direct) {
      case `${Lang.north}`:
          return Lang.NaviNorth;
      case `${Lang.NorthEast}`:
          return Lang.NaviNorthEast;
      case `${Lang.east}`:
          return Lang.NaviEast;
      case `${Lang.SouthEast}`:
          return Lang.NaviSouthEast;
      case `${Lang.south}`:
          return Lang.NaviSouth;
      case `${Lang.southwest}`:
          return Lang.NaviSouthWest;
      case `${Lang.west}`:
          return Lang.NaviWest;
      case `${Lang.NorthWest}`:
          return Lang.NaviNorthWest;
      case `${Lang.Up}`:
          return Lang.NaviUp;
      case `${Lang.Down}`:
          return Lang.NaviDown;
      default:
          return '';
  }
}
