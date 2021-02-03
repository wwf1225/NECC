/**
 * 文本搜索框
 */

import React from 'react';
import style from "./search_input.module.less";


class SearchInputView extends React.Component { 
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  handleBack = () => {
    const {history} = this.props;
    history.go(-1);
    var slideBoard = document.getElementById('slideBoard');
    if (slideBoard) {
      slideBoard.style.top = '75%';
      slideBoard.style.height = '25%';
    }
  }

  


  render() {

    return (
      <div className={style.search_input_bd}>
        {/*<div className={style.search_input_back} onClick={this.handleBack}/>*/}
        <div className={style.search_input_back} onClick={this.handleBack}/>
      </div>
    )
  }

}

export default SearchInputView;