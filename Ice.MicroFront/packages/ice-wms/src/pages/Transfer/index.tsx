import React, { useEffect } from 'react';
import { Typography, Tabs, Divider, Row, Col, Select, Checkbox, Tag, Table, Button, Space, Input, InputNumber, Modal, message, } from 'antd';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';
import OffShelf from './OffShelf';
import OnShelf from './OnShelf';
import TransferSkuPage from './TransferSkuPage';

let { Title } = Typography;

type Props = {
};

class Page extends React.Component<Props> {
    state = {
    }

    render() {
        return <div>
            <Tabs type='card'>
                <Tabs.TabPane tab='上下架操作' key='1'>
                    <OffShelf />
                    <div style={{ height: 15 }} />
                    <OnShelf />
                </Tabs.TabPane>
                <Tabs.TabPane tab='已下架的SKU' key='2'>
                    <TransferSkuPage />
                </Tabs.TabPane>
            </Tabs>
        </div>
    }
}

export default Page;