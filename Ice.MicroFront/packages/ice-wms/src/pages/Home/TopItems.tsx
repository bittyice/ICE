import React, { useEffect, useRef, useState } from 'react';
import { Bar } from '@ant-design/plots';
import { iceFetch } from 'ice-common';

const BarEx = (props: {
    data: Array<{ type: string, value: number }>
}) => {
    const config = {
        height: 100,
        data: props.data,
        xField: 'value',
        yField: 'type',
        seriesField: 'type',
    } as any;

    return <Bar {...config} />;
};

const TopItem = (props: {
    title: string,
    in: number,
    out: number,
    color: string,
}) => {
    return <div className='w-1/4 bg-white rounded-md shadow p-6 flex flex-col gap-4'>
        <div className='text-lg font-semibold'>{props.title}</div>
        <div className='font-semibold text-4xl' style={{ color: props.color }}>{props.in - props.out} +</div>
        <BarEx
            data={[
                { type: '入', value: props.in },
                { type: '出', value: props.out },
            ]}
        />
        <div>
            <span>入：{props.in}</span>
            <span className='ml-4'>出：{props.out}</span>
        </div>
    </div>
}

type InOutSkuNum = {
    in: number,
    out: number
}

export default class TopItems extends React.Component<{
    warehouseId: string
}> {
    state = {
        orderQuantitys: {
            week: {} as InOutSkuNum,
            month: {} as InOutSkuNum,
            quarter: {} as InOutSkuNum,
            year: {} as InOutSkuNum,
        }
    }

    componentDidMount() {
        this.fetchOrderQuantitys();
    }

    fetchOrderQuantitys = () => {
        return iceFetch<any>(`/api/wms/kanban/order-quantity?warehouseId=${this.props.warehouseId}`).then(value => {
            this.setState({
                orderQuantitys: value
            });
        });
    }

    render(): React.ReactNode {
        return <div className='w-full flex' style={{ display: 'flex', gap: 20 }}>
            {
                [
                    { title: '本周SKU', in: this.state.orderQuantitys.week.in, out: this.state.orderQuantitys.week.out, color: '#52c41a' },
                    { title: '本月SKU', in: this.state.orderQuantitys.month.in, out: this.state.orderQuantitys.month.out, color: '#9254de' },
                    { title: '季度SKU', in: this.state.orderQuantitys.quarter.in, out: this.state.orderQuantitys.quarter.out, color: '#531dab' },
                    { title: '今年SKU', in: this.state.orderQuantitys.year.in, out: this.state.orderQuantitys.year.out, color: '#1677ff' },
                ].map(item => (<TopItem {...item} />))
            }
        </div>
    }
}