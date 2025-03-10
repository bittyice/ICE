import React from 'react';
import { ArrowRightOutlined, AppstoreAddOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/plots';
import { iceFetch } from 'ice-common';
import { useNavigate } from 'react-router';
import { Space } from 'antd-mobile'

import './index.css';
import { BoxItem, Box2Item } from 'ice-mobile-layout';

const TopItem2Item = (props: {
    color: string,
    title: string,
    total: number,
    feeTotal: number
}) => {
    return <div className='flex gap-2 items-center'>
        <span className='text-white rounded-md theme-color pt-1 pb-1 pl-2 pr-2' style={{ backgroundColor: props.color }}>{props.title}</span>
        <span>单量</span>
        <span className='text-2xl text-lime-600'>{props.total}</span>
        <span>单</span>
        <span>,</span>
        <span>金额</span>
        <span className='text-2xl text-lime-600'>{props.feeTotal}</span>
        <span>￥</span>
    </div>
}

type TopItem2Props = {
    titile: string,
    color: string,
    weekTotal: number,
    weekFeeTotal: number,
    monthTotal: number,
    monthFeeTotal: number,
    quarterTotal: number,
    quarterFeeTotal: number,
    yearTotal: number,
    yearFeeTotal: number,
    total: number,
    feeTotal: number,
}
const TopItem2 = (props: TopItem2Props) => {
    return <BoxItem
        color={props.color}
    >
        <div className='text-xl font-semibold mb-4'>{props.titile}</div>
        <div className='flex flex-col gap-4'>
            <TopItem2Item title='本周' total={props.weekTotal} feeTotal={props.weekFeeTotal} color='#d3adf7' />
            <TopItem2Item title='本月' total={props.monthTotal} feeTotal={props.monthFeeTotal} color='#9254de' />
            <TopItem2Item title='季度' total={props.quarterTotal} feeTotal={props.quarterFeeTotal} color='#531dab' />
            <TopItem2Item title='本年' total={props.yearTotal} feeTotal={props.yearFeeTotal} color='#22075e' />
        </div>
    </BoxItem>
}

type BarData = {
    label: string,
    value: string | number,
    type: string
}

class Home extends React.Component<{}> {
    state = {
        // 顶部数据
        topItem2Datas: {
            purchase: {} as TopItem2Props,
            purchaseReturn: {} as TopItem2Props,
            sale: {} as TopItem2Props,
            saleReturn: {} as TopItem2Props,
        },
        // 单量数据
        orderQuantityBarDatas: [] as Array<BarData>,
        // 额度数据
        orderFeeBarDatas: [] as Array<BarData>,
        // 待处理订单数量
        pendingOrderCounts: {
            purchaseCount: 0,
            purchaseReturnCount: 0,
            saleCount: 0,
            saleReturnCount: 0
        }
    }

    componentDidMount() {
        this.fetchOrderTimeStatistics();
        this.fetchOrderMonthQuantity();
        this.fetchPendingOrderCount();
    }

    fetchOrderTimeStatistics = () => {
        return iceFetch<any>('/api/psi/kanban-home/order-time-statistics', {
            method: 'GET'
        }).then(result => {
            this.setState({ topItem2Datas: result });
        });
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

    fetchPendingOrderCount = () => {
        return iceFetch<any>('/api/psi/kanban-home/pending-order-count', {
            method: 'GET'
        }).then(value => {
            this.setState({ pendingOrderCounts: value });
        });
    }

    render(): React.ReactNode {
        return <div className='oms-home w-full pb-4'>
            <div className='bg-white pl-4 pr-4 pt-8 pb-8'>
                <div className='text-xl font-semibold'>费用</div>
                <Column
                    height={250}
                    data={this.state.orderFeeBarDatas}
                    xField='label'
                    yField='value'
                    seriesField='type'
                    isGroup
                />
            </div>
            <div className='bg-white mt-4 pl-4 pr-4 pt-8 pb-8'>
                <div className='text-xl font-semibold'>单量</div>
                <Column
                    height={250}
                    data={this.state.orderQuantityBarDatas}
                    xField='label'
                    yField='value'
                    seriesField='type'
                    isGroup
                />
            </div>
            <div className='flex flex-col w-full gap-4 mt-4'>
                <TopItem2 {...this.state.topItem2Datas.purchase} titile='采购' color='#efdbff' />
                <TopItem2 {...this.state.topItem2Datas.purchaseReturn} titile='采购退货' color='#b37feb' />
                <TopItem2 {...this.state.topItem2Datas.sale} titile='销售' color='#722ed1' />
                <TopItem2 {...this.state.topItem2Datas.saleReturn} titile='销售退货' color='#391085' />
            </div>
        </div>
    }
}

export default Home;