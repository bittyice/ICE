import React from 'react';
import { Button, Tag, Card, Table, Divider } from 'antd';
import { iceFetch } from 'ice-common';
import { enums } from 'ice-core';

class InboundOrder extends React.Component<{}> {
    state = {
        orders: [] as Array<any>
    }

    componentDidMount() {
        this.fetchInboundOrders();
    }

    fetchInboundOrders = () => {
        iceFetch<any>(`/api/psi/purchase-order`, {
            method: 'GET',
            urlParams: {
                status: enums.OMSPurchaseOrderStatus.PendingReview,
                skipCount: 0,
                maxResultCount: 5
            }
        }).then((datas) => {
            this.setState({
                orders: datas.items
            });
        });
    }

    render(): React.ReactNode {
        return <div style={{ width: '25%' }}>
            <Table
                className='shadow-md'
                bordered
                columns={[{
                    title: '待处理采购订单',
                    key: 'orderNumber',
                    dataIndex: 'orderNumber'
                }, {
                    title: '金额',
                    key: 'price',
                    dataIndex: 'price',
                }]}
                dataSource={this.state.orders}
                pagination={false}
            />
        </div>
    }
}

export default InboundOrder;