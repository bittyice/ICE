import React from 'react';
import { Typography, Timeline, Card, Table, Space, Progress } from 'antd';
import { ArrowRightOutlined, AppstoreAddOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Column, RadialBar } from '@ant-design/plots';
import { iceFetch } from 'ice-common';

import { BoxItem, Box2Item, MenuProvider } from 'ice-layout';

const ColumnEx = (props: {
    data: Array<{ label: string, type: string, value: number }>
}) => {
    const config = {
        data: props.data,
        height: 150,
        isGroup: true,
        xField: 'type',
        yField: 'value',
        // seriesField: 'type',
        /** 设置颜色 */
        //color: ['#1ca9e6', '#f88c24'],
        /** 设置间距 */
        // marginRatio: 0.1,
        label: {
            // 可手动配置 label 数据标签位置
            position: 'middle',
            // 'top', 'middle', 'bottom'
            // 可配置附加的布局方法
            layout: [
                // 柱形图数据标签位置自动调整
                {
                    type: 'interval-adjust-position',
                }, // 数据标签防遮挡
                {
                    type: 'interval-hide-overlap',
                }, // 数据标签文颜色自动调整
                {
                    type: 'adjust-color',
                },
            ],
        },
    } as any;

    return <Column {...config} />;
};

const TopItem2Item = (props: {
    color: string,
    title: string,
    total: number,
    feeTotal: number,
    percent: number,
}) => {
    return <div className='flex gap-3 items-center'>
        <span className='text-white rounded-md theme-color pt-2 pb-2 pl-3 pr-3' style={{ backgroundColor: props.color }}>{props.title}</span>
        <div className='grow ml-2'>
            <div className='flex gap-2 items-end'>
                <span>单量</span>
                <span className='text-xl text-lime-600'>{props.total}</span>
                <span>单</span>
                <span>,</span>
                <span>金额</span>
                <span className='text-xl text-lime-600'>{props.feeTotal}</span>
                <span>￥</span>
            </div>
            <div>
                <Progress className='mb-0' percent={props.percent} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
            </div>
        </div>
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
}
const TopItem2 = (props: TopItem2Props) => {
    return <div className='w-1/4 bg-white rounded-md shadow p-5'>
        <div className='mb-4'>
            <span className='text-xl font-semibold'>{props.titile}</span>
            <span className='ml-4 text-gray-400'>单量和额度统计</span>
        </div>
        <div className='flex flex-col gap-3'>
            <TopItem2Item
                title='本周'
                total={props.weekTotal}
                feeTotal={props.weekFeeTotal}
                percent={props.yearFeeTotal === 0 ? 0 : Math.floor(props.weekFeeTotal * 100 / props.yearFeeTotal)}
                color='#d3adf7'
            />
            <TopItem2Item
                title='本月'
                total={props.monthTotal}
                feeTotal={props.monthFeeTotal}
                percent={props.yearFeeTotal === 0 ? 0 : Math.floor(props.monthFeeTotal * 100 / props.yearFeeTotal)}
                color='#9254de'
            />
            <TopItem2Item title='季度'
                total={props.quarterTotal}
                feeTotal={props.quarterFeeTotal}
                percent={props.yearFeeTotal === 0 ? 0 : Math.floor(props.quarterFeeTotal * 100 / props.yearFeeTotal)}
                color='#531dab'
            />
            <TopItem2Item
                title='本年'
                total={props.yearTotal}
                feeTotal={props.yearFeeTotal}
                percent={100}
                color='#22075e'
            />
        </div>
    </div>
}

class TopItems extends React.Component<{}> {
    state = {
        topItem2Datas: {
            purchase: {} as TopItem2Props,
            purchaseReturn: {} as TopItem2Props,
            sale: {} as TopItem2Props,
            saleReturn: {} as TopItem2Props,
        },
    }

    componentDidMount() {
        this.fetchOrderTimeStatistics();
    }

    fetchOrderTimeStatistics = () => {
        return iceFetch<any>('/api/psi/kanban-home/order-time-statistics', {
            method: 'GET'
        }).then(result => {
            this.setState({ topItem2Datas: result });
        });
    }

    render(): React.ReactNode {
        return <div style={{ display: 'flex', gap: 20 }}>
            <TopItem2 {...this.state.topItem2Datas.purchase} titile='采购' color='#efdbff' />
            <TopItem2 {...this.state.topItem2Datas.purchaseReturn} titile='采购退货' color='#b37feb' />
            <TopItem2 {...this.state.topItem2Datas.sale} titile='销售' color='#722ed1' />
            <TopItem2 {...this.state.topItem2Datas.saleReturn} titile='销售退货' color='#391085' />
        </div>
    }
}

export default TopItems;