import React from 'react';
import JsBarcode from 'jsbarcode';
import { message } from 'antd';

type Props = {
    code: any
}

export default class extends React.Component<Props> {
    random = Math.round(Math.random() * 1000000);

    componentDidMount() {
        try {
            JsBarcode('#' + this.getID(), this.props.code);
        }
        catch (ex: any) {
            console.error(ex);
            message.error('条形码生成错误');
        }
    }

    shouldComponentUpdate(nextProps: Props) {
        return this.props.code != nextProps.code;
    }

    getID() {
        return `_img_bracode_${this.props.code}_${this.random}_`
    }

    render() {
        return <div style={{ width: '100%' }}>
            <img style={{ width: '100%', height: '30mm' }} id={this.getID()} src="" alt="" />
        </div>
    }
}