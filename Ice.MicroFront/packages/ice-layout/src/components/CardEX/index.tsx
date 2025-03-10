import React from 'react';
import { Typography, Divider, Row } from 'antd';
import './index.css';

let { Title } = Typography;

export default class extends React.Component<{
    style?: React.CSSProperties,
    bodyStyle?: React.CSSProperties,
    title: string | React.ReactNode,
    children?: React.ReactNode
}> {
    render() {
        return <div className='cardex p-4 rounded bg-gray-50' style={this.props.style}>
            <div className='cardex-title'>{this.props.title}</div>
            <Row wrap className='cardex-body' style={this.props.bodyStyle}>
                {this.props.children}
            </Row>
        </div>
    }
}