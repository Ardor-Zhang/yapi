// 测试集合中的环境切换

import React from 'react';
import copy from 'copy-to-clipboard';
import { Button, message } from 'antd';
import { UnControlled } from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript.js';

import './CodeMirrorWithCopy.scss';

export default class CaseEnv extends React.Component {
  constructor(props) {
    super(props);
  }

  hanleCopy() {
    copy(this.props.value);
    message.success('已经成功复制到剪切板');
  }

  render() {
    return (
      <div className='code-mirror-with-copy'>
        <Button
          className='copy-button'
          onClick={ () => this.hanleCopy() }
        >
          复制
        </Button>
        
        <UnControlled { ...this.props }/>
      </div>
    );
  }
}
