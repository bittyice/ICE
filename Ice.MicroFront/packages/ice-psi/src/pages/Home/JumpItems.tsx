import React from 'react';
import { Typography, Timeline, Card, Table, Space } from 'antd';
import { ArrowRightOutlined, AppstoreAddOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/plots';
import { iceFetch } from 'ice-common';
import { useNavigate } from 'react-router';

import './index.css';
import { Box2Item, MenuProvider } from 'ice-layout';

type JumpItemProps = {
    url: string,
    title: string,
    orderQuantity: number,
    color: string
}
const JumpItem = (props: JumpItemProps) => {
    const nav = useNavigate();
    return <Box2Item
        color={props.color}
    >
        <div className='font-semibold text-lg'>{props.title}</div>
        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div>共 <span style={{ fontSize: 24 }}>{props.orderQuantity}</span> 单</div>
        </div>
        <Space className='font-semibold text-lg' style={{ cursor: 'pointer' }} onClick={() => {
            nav(props.url);
        }}>
            <span>现在去处理</span>
            <ArrowRightOutlined />
        </Space>
    </Box2Item>
}

class JumpItems extends React.Component<{}> {
    state = {
        // 待处理订单数量
        pendingOrderCounts: {
            purchaseCount: 0,
            purchaseReturnCount: 0,
            saleCount: 0,
            saleReturnCount: 0
        }
    }

    componentDidMount() {
        this.fetchPendingOrderCount();
    }

    fetchPendingOrderCount = () => {
        return iceFetch<any>('/api/psi/kanban-home/pending-order-count', {
            method: 'GET'
        }).then(value => {
            this.setState({ pendingOrderCounts: value });
        });
    }

    render(): React.ReactNode {
        return <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <JumpItem color='#b37feb' url={MenuProvider.getUrl(['system-order', 'purchase-order'])} title='待处理采购单' orderQuantity={this.state.pendingOrderCounts.purchaseCount} />
            <JumpItem color='#722ed1' url={MenuProvider.getUrl(['system-order', 'purchase-return-order'])} title='待处理采购退货单' orderQuantity={this.state.pendingOrderCounts.purchaseReturnCount} />
            <JumpItem color='#391085' url={MenuProvider.getUrl(['system-order', 'sale-order'])} title='待处理销售单' orderQuantity={this.state.pendingOrderCounts.saleCount} />
            <JumpItem color='#120338' url={MenuProvider.getUrl(['system-order', 'sale-return-order'])} title='待处理门店退货单' orderQuantity={this.state.pendingOrderCounts.saleReturnCount} />
        </div>
    }
}

export default JumpItems;