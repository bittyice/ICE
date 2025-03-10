import React, { useEffect, useState } from 'react';
import { iceFetch } from 'ice-common';
import { Column, Pie, Bar } from '@ant-design/plots';
import { CrownOutlined, AlignLeftOutlined } from '@ant-design/icons';
import { DatePicker, Tag } from 'antd';
import dayjs from 'dayjs';

type DataType = { key: string, quantity: number }

const Item = (props: {
    index: number,
    name: string,
    quantity: number
}) => {
    return <div className={`flex gap-2 pt-1 pb-1 pr-4 pl-4 rounded ${props.index === 1 ? 'text-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white pt-2 pb-2' : props.index === 2 ? 'text-lg' : props.index === 2 ? 'text-lg' : ''}`}>
        <CrownOutlined />
        <span>{props.index}</span>
        <span className='truncate'>{props.name}</span>
        <div className='grow' />
        <span className='grow-0 shrink-0'>{props.quantity} 次</span>
    </div>
}

const Ranking = (props: {
    datas: Array<DataType>
}) => {
    let items: Array<React.ReactNode> = [];
    for (let n = 0; n < 10; n++) {
        items.push(<Item index={n + 1} name={props.datas[n]?.key || '--'} quantity={props.datas[n]?.quantity || 0} />);
    }

    return <div className='p-4 bg-white rounded-md shadow'>
        <div className=' text-xl font-semibold'>
            <AlignLeftOutlined />
            <span className='ml-2'>内容排名</span>
        </div>
        <div className='flex flex-col gap-4 mt-4'>
            {items}
        </div>
    </div>
}

export default class extends React.Component {
    state = {
        dates: [new Date(), new Date()] as [Date, Date],
        datasOfFocusQuestion: [] as Array<DataType>,
    }

    componentDidMount(): void {
        this.fetchDatasOfFocusQuestion();
    }

    fetchDatasOfFocusQuestion = async () => {
        let start = this.state.dates[0];
        let end = this.state.dates[1];
        let list = await iceFetch<Array<DataType>>('/api/ai/questionnaire-result-report/quantity-of-focus-question', {
            method: 'GET',
            urlParams: {
                creationTimeMin: new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString(),
                creationTimeMax: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59).toISOString(),
            }
        });
        this.setState({ datasOfFocusQuestion: list });
    }

    render(): React.ReactNode {
        let newdatasOfFocusQuestion = this.state.datasOfFocusQuestion.slice(0, 10);

        return <div>
            <div className='p-2 pl-4 pr-4 bg-white rounded'>
                <span>过滤时间</span>
                <DatePicker.RangePicker
                    bordered={false}
                    allowClear={false}
                    value={[dayjs(this.state.dates[0]), dayjs(this.state.dates[1])]}
                    onChange={arr => {
                        if (!arr) {
                            return;
                        }
                        this.setState({
                            dates: [arr[0]?.toDate(), arr[1]?.toDate()]
                        }, () => {
                            this.fetchDatasOfFocusQuestion();
                        })
                    }}
                />
            </div>
            <div className='flex gap-4 mt-4'>
                <div className='w-3/4 bg-white rounded shadow'>
                    <div className='p-4 text-lg font-semibold'>关注内容占比</div>
                    <Pie
                        height={400}
                        appendPadding={10}
                        data={newdatasOfFocusQuestion}
                        angleField='quantity'
                        colorField='key'
                        radius={0.8}
                        label={{
                            type: 'outer',
                            content: '{name} {percentage}',
                        }}
                        interactions={[
                            {
                                type: 'pie-legend-active',
                            },
                            {
                                type: 'element-active',
                            },
                        ]}
                    />
                </div>
                <div className='w-1/4'>
                    <Ranking datas={newdatasOfFocusQuestion} />
                </div>
            </div>
            <div className='mt-8'>
                <div className='text-lg font-semibold'>所有内容</div>
                <div className='mt-4'>
                    {
                        this.state.datasOfFocusQuestion.map(item => <Tag>
                            <span>{item.key}</span>
                            <span className='ml-2'>{item.quantity}次</span>
                        </Tag>)
                    }
                </div>
            </div>
        </div>
    }
}