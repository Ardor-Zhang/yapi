import './View.scss';
import React, { PureComponent as Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Table, Icon, message } from 'antd';
import CodeMirrorWithCopy from 'client/components/CodeMirrorWithCopy/CodeMirrorWithCopy';
import ErrMsg from '../../../../components/ErrMsg/ErrMsg.js';
import constants from '../../../../constants/variable.js';
import copy from 'copy-to-clipboard';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript.js';
import { transform, transformQuery } from "yapi-json-to-interface";

const HTTP_METHOD = constants.HTTP_METHOD;

@connect(state => {
  return {
    curData: state.inter.curdata,
    custom_field: state.group.field,
    currProject: state.project.currProject
  };
})
class TSInterface extends Component {
  constructor(props) {
    super(props);
    this.state = {
      init: true,
      enter: false,
    };
  }
  static propTypes = {
    curData: PropTypes.object,
    currProject: PropTypes.object,
    custom_field: PropTypes.object
  };

  options = {
    mode: 'javascript',
    theme: 'material',
    lineNumbers: true
  }

  req_body_form(req_body_type, req_body_form) {
    if (req_body_type === 'form') {
      const columns = [
        {
          title: '参数名称',
          dataIndex: 'name',
          key: 'name',
          width: 140
        },
        {
          title: '参数类型',
          dataIndex: 'type',
          key: 'type',
          width: 100,
          render: text => {
            text = text || '';
            return text.toLowerCase() === 'text' ? (
              <span>
                <i className="query-icon text">T</i>文本
              </span>
            ) : (
              <span>
                <Icon type="file" className="query-icon" />文件
              </span>
            );
          }
        },
        {
          title: '是否必须',
          dataIndex: 'required',
          key: 'required',
          width: 100
        },
        {
          title: '示例',
          dataIndex: 'example',
          key: 'example',
          width: 80,
          render(_, item) {
            return <p style={{ whiteSpace: 'pre-wrap' }}>{item.example}</p>;
          }
        },
        {
          title: '备注',
          dataIndex: 'value',
          key: 'value',
          render(_, item) {
            return <p style={{ whiteSpace: 'pre-wrap' }}>{item.value}</p>;
          }
        }
      ];

      const dataSource = [];
      if (req_body_form && req_body_form.length) {
        req_body_form.map((item, i) => {
          dataSource.push({
            key: i,
            name: item.name,
            value: item.desc,
            example: item.example,
            required: item.required == 0 ? '否' : '是',
            type: item.type
          });
        });
      }

      return (
        <div style={{ display: dataSource.length ? '' : 'none' }} className="colBody">
          <Table
            bordered
            size="small"
            pagination={false}
            columns={columns}
            dataSource={dataSource}
          />
        </div>
      );
    }
  }

  res_body(res_body_type, res_body = '{}', res_body_is_json_schema) {
    return (
      <div className='for-margin'>
        <CodeMirrorWithCopy
          value={transform(JSON.parse(res_body), 'ResBody')}
          options={this.options}
        />
      </div>
    )
  }

  req_body(req_body_type, req_body_other = '{}', req_body_is_json_schema) {
    return <CodeMirrorWithCopy
      value={transform(JSON.parse(req_body_other), 'ReqBody')}
      options={this.options}
    />
  }

  req_query(query) {
    return (
      <CodeMirrorWithCopy
        value={transformQuery(query, 'ReqQuery')}
        options={this.options}
      />
    );
  }

  componentDidMount() {
    if (!this.props.curData.title && this.state.init) {
      this.setState({ init: false });
    }
  }

  copyUrl = url => {
    copy(url);
    message.success('已经成功复制到剪切板');
  };

  render() {
    const req_dataSource = [];
    if (this.props.curData.req_params && this.props.curData.req_params.length) {
      this.props.curData.req_params.map((item, i) => {
        req_dataSource.push({
          key: i,
          name: item.name,
          desc: item.desc,
          example: item.example
        });
      });
    }

    let bodyShow =
      this.props.curData.req_body_other ||
      (this.props.curData.req_body_type === 'form' &&
        this.props.curData.req_body_form &&
        this.props.curData.req_body_form.length);

    let requestShow =
      (req_dataSource && req_dataSource.length) ||
      (this.props.curData.req_query && this.props.curData.req_query.length) ||
      bodyShow;

    let res = (
      <div className="caseContainer">
        <h2 
          className="interface-title"
          style={{ display: requestShow ? '' : 'none', marginTop: 0 }}
        >
          请求参数
        </h2>

        {this.props.curData.req_query && this.props.curData.req_query.length ? (
          <div className="colQuery">
            <h3 className="col-title">Query：</h3>
            {this.req_query(this.props.curData.req_query)}
          </div>
        ) : (
          ''
        )}

        <div
          style={{
            display:
              this.props.curData.method &&
                HTTP_METHOD[this.props.curData.method.toUpperCase()].request_body
                ? ''
                : 'none'
          }}
        >
          <h3 style={{ display: bodyShow ? '' : 'none' }} className="col-title">
            Body:
          </h3>
          {this.props.curData.req_body_type === 'form'
            ? this.req_body_form(this.props.curData.req_body_type, this.props.curData.req_body_form)
            : this.req_body(
              this.props.curData.req_body_type,
              this.props.curData.req_body_other,
              this.props.curData.req_body_is_json_schema
            )}
        </div>

        <h2 className="interface-title">返回数据</h2>
        {this.res_body(
          this.props.curData.res_body_type,
          this.props.curData.res_body,
          this.props.curData.res_body_is_json_schema
        )}
      </div>
    );

    if (!this.props.curData.title) {
      if (this.state.init) {
        res = <div />;
      } else {
        res = <ErrMsg type="noData" />;
      }
    }
    return res;
  }
}

export default TSInterface;

