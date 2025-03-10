import React, { useEffect, useRef, useState } from 'react';
import { Typography, Timeline, Card, Table, Space } from 'antd';
import { ArrowRightOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { Column, Pie, Bar } from '@ant-design/plots';
import { iceFetch } from 'ice-common';

type BarData = {
    label: string,
    value: string | number,
    type: string
}

export default class OrderMonthQuantity extends React.Component<{
    warehouseId: string
}> {
    state = {
        // 单量数据
        orderQuantityBarDatas: [] as Array<BarData>,
    }

    componentDidMount() {
        this.fetchOrderMonthQuantity();
    }

    fetchOrderMonthQuantity = () => {
        return iceFetch<any>(`/api/wms/kanban/order-month-quantity?warehouseId=${this.props.warehouseId}`)
            .then(result => {
                const { inbound, outbound } = result;
                let now = new Date();
                // 月初
                let monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                let months: Array<{ year: number, month: number }> = [];
                months.unshift({ year: monthStart.getFullYear(), month: monthStart.getMonth() + 1 });
                for (let n = 1; n <= 11; n++) {
                    monthStart.setMonth(monthStart.getMonth() - 1);
                    months.unshift({ year: monthStart.getFullYear(), month: monthStart.getMonth() + 1 });
                }

                let orderQuantityBarDatas: Array<BarData> = [];
                for (let month of months) {
                    let inboundItem = inbound.find((e: any) => e.year == month.year && e.month == month.month);
                    orderQuantityBarDatas.push({
                        label: `${month.year}-${month.month}`,
                        value: inboundItem?.quantity || 0,
                        type: '入库'
                    });
                    let outboundItem = outbound.find((e: any) => e.year == month.year && e.month == month.month);
                    orderQuantityBarDatas.push({
                        label: `${month.year}-${month.month}`,
                        value: outboundItem?.quantity || 0,
                        type: '出库'
                    });
                }
                this.setState({ orderQuantityBarDatas });
            });
    }

    render(): React.ReactNode {
        return <Card
            title={<div className='pt-4 pb-4 flex justify-between'>
                <div>
                    <div>出入库单量</div>
                    <div className='text-xs font-medium mt-2 text-gray-500'>前12个出库单量对比</div>
                </div>
                <AppstoreAddOutlined style={{ fontSize: 16 }} />
            </div>}
        >
            <Column
                height={300}
                data={this.state.orderQuantityBarDatas}
                xField='label'
                yField='value'
                seriesField='type'
                isGroup
            />
        </Card>
    }
}