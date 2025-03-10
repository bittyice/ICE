import React, { useEffect, useRef, useState } from 'react';
import { Typography, Timeline, Card, Table, Space } from 'antd';
import { ArrowRightOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import VacancyRate from './VacancyRate';
import InboundOrder from './InboundOrder';
import LoginLog from './LoginLog';
import { Column, Pie, Bar } from '@ant-design/plots';
import { iceFetch } from 'ice-common';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';

import './index.css';
import { Box2Item, BoxItem, MenuProvider } from 'ice-layout';
import { IceStateType } from 'ice-core';
import TopItems from './TopItems';
import OrderMonthQuantity from './OrderMonthQuantity';
import SkuRanking from './SkuRanking';


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
        <div style={{ fontSize: 14, fontWeight: 'bold' }}>{props.title}</div>
        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div>共 <span style={{ fontSize: 24 }}>{props.orderQuantity}</span> 单</div>
        </div>
        <Space style={{ cursor: 'pointer' }} onClick={() => {
            nav(props.url);
        }}>
            <span>现在去处理</span>
            <ArrowRightOutlined />
        </Space>
    </Box2Item>
}

type BarData = {
    label: string,
    value: string | number,
    type: string
}

class Home extends React.Component<{
    warehouseId: string
}> {
    state = {
        // 待处理订单数量
        pendingOrderCounts: {
            inbound: 0,
            outbound: 0
        }
    }

    componentDidMount() {
        this.fetchPendingOrderCount();
    }

    fetchPendingOrderCount = () => {
        return iceFetch<any>(`/api/wms/kanban/pending-order-count?warehouseId=${this.props.warehouseId}`).then(value => {
            this.setState({ pendingOrderCounts: value });
        });
    }

    render(): React.ReactNode {
        return <div className='wms-home'>
            <TopItems warehouseId={this.props.warehouseId} />
            <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                <div className='shadow-sm rounded' style={{ width: '75%' }}>
                    <OrderMonthQuantity warehouseId={this.props.warehouseId} />
                </div>
                <div style={{ width: '25%' }}>
                    <SkuRanking warehouseId={this.props.warehouseId} />
                </div>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                <div className='shadow rounded-md' style={{ width: '35%', backgroundColor: '#fff' }}>
                    <VacancyRate warehouseId={this.props.warehouseId} />
                </div>
                <div className='rounded-md' style={{ width: '65%' }}>
                    <InboundOrder />
                </div>
            </div>
        </div>
    }
}

export default () => {
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    return <Home warehouseId={warehouseId} />
}