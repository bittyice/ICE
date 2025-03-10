import React from 'react';
import { Typography, Timeline, Card, Table, Space } from 'antd';
import { ArrowRightOutlined, AppstoreAddOutlined, EllipsisOutlined } from '@ant-design/icons';
import Order from './Order';
import LoginLog from './LoginLog';
import { Column } from '@ant-design/plots';
import { iceFetch } from 'ice-common';
import { useNavigate } from 'react-router';

import './index.css';
import { BoxItem, Box2Item, MenuProvider } from 'ice-layout';
import TopItems from './TopItems';
import JumpItems from './JumpItems';
import SkuRanking from './SkuRanking';

type BarData = {
    label: string,
    value: string | number,
    type: string
}

class Home extends React.Component<{}> {
    state = {
        // 单量数据
        orderQuantityBarDatas: [] as Array<BarData>,
        // 额度数据
        orderFeeBarDatas: [] as Array<BarData>,
    }

    componentDidMount() {
        this.fetchOrderMonthQuantity();
    }

    fetchOrderMonthQuantity = () => {
        return iceFetch<any>('/api/psi/kanban-home/order-month-quantity', {
            method: 'GET'
        }).then(result => {
            const { purchase, purchaseReturn, sale, saleReturn } = result;
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
            let orderFeeBarDatas: Array<BarData> = [];
            for (let month of months) {
                // 采购
                let purchaseItem = purchase.find((e: any) => e.year == month.year && e.month == month.month);
                orderQuantityBarDatas.push({
                    label: `${month.year}-${month.month}`,
                    value: purchaseItem?.quantity || 0,
                    type: '采购'
                });
                orderFeeBarDatas.push({
                    label: `${month.year}-${month.month}`,
                    value: purchaseItem?.totalFee || 0,
                    type: '采购'
                });
                // 采购退货
                let returnItem = purchaseReturn.find((e: any) => e.year == month.year && e.month == month.month);
                orderQuantityBarDatas.push({
                    label: `${month.year}-${month.month}`,
                    value: returnItem?.quantity || 0,
                    type: '采购退货'
                });
                orderFeeBarDatas.push({
                    label: `${month.year}-${month.month}`,
                    value: returnItem?.totalFee || 0,
                    type: '采购退货'
                });
                // 销售
                let saleItem = sale.find((e: any) => e.year == month.year && e.month == month.month);
                orderQuantityBarDatas.push({
                    label: `${month.year}-${month.month}`,
                    value: saleItem?.quantity || 0,
                    type: '销售'
                });
                orderFeeBarDatas.push({
                    label: `${month.year}-${month.month}`,
                    value: saleItem?.totalFee || 0,
                    type: '销售'
                });
                // 销售退货
                let saleReturnItem = saleReturn.find((e: any) => e.year == month.year && e.month == month.month);
                orderQuantityBarDatas.push({
                    label: `${month.year}-${month.month}`,
                    value: saleReturnItem?.quantity || 0,
                    type: '销售退货'
                });
                orderFeeBarDatas.push({
                    label: `${month.year}-${month.month}`,
                    value: saleReturnItem?.totalFee || 0,
                    type: '销售退货'
                });
            }
            this.setState({ orderQuantityBarDatas, orderFeeBarDatas });
        });
    }

    render(): React.ReactNode {
        return <div className='oms-home' style={{ paddingBottom: 20 }}>
            <TopItems />
            <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                <div className='shadow-md' style={{ width: '75%', padding: 20, backgroundColor: '#fff', borderRadius: 10 }}>
                    <Typography.Title level={5}>费用</Typography.Title>
                    <Column
                        height={300}
                        data={this.state.orderFeeBarDatas}
                        xField='label'
                        yField='value'
                        seriesField='type'
                        isGroup
                    />
                </div>
                <div style={{ width: '25%' }}>
                    <SkuRanking />
                </div>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                <div style={{ width: '25%' }}>
                    <LoginLog />
                </div>
                <div className='shadow-md' style={{ width: '75%', padding: 20, backgroundColor: '#fff', borderRadius: 10 }}>
                    <Typography.Title level={5}>单量</Typography.Title>
                    <Column
                        height={300}
                        data={this.state.orderQuantityBarDatas}
                        xField='label'
                        yField='value'
                        seriesField='type'
                        isGroup
                    />
                </div>
            </div>
            <div className='mt-8'>
                <JumpItems />
            </div>
        </div>
    }
}

export default Home;