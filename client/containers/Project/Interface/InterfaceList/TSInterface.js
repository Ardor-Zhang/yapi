import './View.scss';
import React, { PureComponent as Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ErrMsg from '../../../../components/ErrMsg/ErrMsg.js';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript.js';
import { transformSchema, transformRaw, transformForm } from "yapi-json-to-interface";
import CodeMirrorWithCopy from 'client/components/CodeMirrorWithCopy/CodeMirrorWithCopy';

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
      enter: false
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
      return (
        req_body_form
        && req_body_form.length
        && <CodeMirrorWithCopy
          value={transformForm((req_body_form || []), 'ReqBody')}
          options={this.options}
        />
      );
    }
  }

  standardizeData(data, type) {
    if (type === 'json') {
      try {
        return JSON.parse(data || '{}');
      } catch (error) {
        console.log(error);
        return {}
      }
    } else if (type === 'raw') {
      try {
        return eval('(' + data + ')');
      } catch (error) {
        console.log(error);
        return {}
      }
    } else {
      return {}
    }
  }

  res_body(res_body_type, res_body, res_body_is_json_schema) {
    if (res_body_type === 'json') {
      if (res_body_is_json_schema) {
        return <CodeMirrorWithCopy
          value={ transformSchema(this.standardizeData(res_body, 'json'), 'ResBody') }
          options={this.options}
        />
      } else {
        return <CodeMirrorWithCopy
          value={transformRaw(this.standardizeData(res_body, 'raw'), 'ResBody') }
          options={this.options}
        />
      }
    } else if (res_body_type === 'raw') {
      let data = {};
      if (res_body_is_json_schema) {
        data = this.standardizeData(res_body, 'raw');
      } else {
        data = this.standardizeData(res_body, 'json');
      };
      return (
        <div className="colBody">
          <CodeMirrorWithCopy
            value={ transformRaw(data, 'ResBody') }
            options={ this.options }
          />
        </div>
      );
    }
  }

  req_body(req_body_type, req_body_other, req_body_is_json_schema) {
    if (req_body_other) {
      if (req_body_is_json_schema && req_body_type === 'json') {
        return <CodeMirrorWithCopy
          value={ transformSchema(this.standardizeData(req_body_other, 'json'), 'ReqBody') }
          options={ this.options }
        />;
      } else {
        return (
          <div className="colBody">
            <CodeMirrorWithCopy
              value={ transformRaw(this.standardizeData(req_body_other, 'raw'), 'ReqBody') }
              options={ this.options }
            />
          </div>
        );
      }
    }
  }

  req_query(query) {
    return (
      <CodeMirrorWithCopy
        value={transformForm((query || []), 'ReqQuery')}
        options={this.options}
      />
    );
  }

  componentDidMount() {
    if (!this.props.curData.title && this.state.init) {
      this.setState({ init: false });
    }
  }


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
        {
          requestShow
            ? <h2 className="interface-title">
              请求参数
            </h2>
            : ''
        }

        {
          requestShow && this.props.curData.req_query && this.props.curData.req_query.length ? (
            <div className="colQuery">
              <h3 className="col-title">Query：</h3>
              {this.req_query(this.props.curData.req_query)}
            </div>
          ) : ''
        }

        {
          bodyShow
            ? <h3 style={{ display: bodyShow ? '' : 'none' }} className="col-title">
              Body:
            </h3>
            : ''
        }

        <div>
          {
            bodyShow
              ? this.props.curData.req_body_type === 'form'
                ? this.req_body_form(this.props.curData.req_body_type, this.props.curData.req_body_form)
                : this.req_body(
                  this.props.curData.req_body_type,
                  this.props.curData.req_body_other,
                  this.props.curData.req_body_is_json_schema
                )
              : ''
          }
        </div>

        <h2 className="interface-title">返回数据</h2>
        <div>
          {
            this.res_body(
              this.props.curData.res_body_type,
              this.props.curData.res_body,
              this.props.curData.res_body_is_json_schema
            )
          }
        </div>

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
