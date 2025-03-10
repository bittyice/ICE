import React, { useEffect, useState } from 'react';
import { iceFetch } from 'ice-common';
import { Column, Pie, Bar } from '@ant-design/plots';
import { CrownOutlined, AlignLeftOutlined } from '@ant-design/icons';
import { DatePicker } from 'antd';
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
        <span>{props.name}</span>
        <div className='grow' />
        <span>{props.quantity} 份</span>
    </div>
}

const Ranking = (props: {
    datas: Array<DataType>
}) => {
    let items: Array<React.ReactNode> = [];
    for (let n = 0; n < 8; n++) {
        items.push(<Item index={n + 1} name={props.datas[n]?.key || '--'} quantity={props.datas[n]?.quantity || 0} />);
    }

    return <div className='p-4 bg-white rounded-md shadow'>
        <div className=' text-xl font-semibold'>
            <AlignLeftOutlined />
            <span className='ml-2'>排名</span>
        </div>
        <div className='flex flex-col gap-4 mt-4'>
            {items}
        </div>
    </div>
}

export default class extends React.Component {
    state = {
        dates: [new Date(), new Date()] as [Date, Date],
        datasOfTag: [] as Array<DataType>,
        datasOfProvince: [] as Array<DataType>,
    }

    componentDidMount(): void {
        this.fetchDatasOfTag();
        this.fetchDatasOfProvince();
    }

    fetchDatasOfTag = async () => {
        let start = this.state.dates[0];
        let end = this.state.dates[1];
        let list = await iceFetch<Array<DataType>>('/api/ai/questionnaire-result-report/quantity-of-tag-name', {
            method: 'GET',
            urlParams: {
                creationTimeMin: new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString(),
                creationTimeMax: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59).toISOString(),
            }
        });
        this.setState({ datasOfTag: list });
    }

    fetchDatasOfProvince = async () => {
        let start = this.state.dates[0];
        let end = this.state.dates[1];
        let list = await iceFetch<Array<DataType>>('/api/ai/questionnaire-result-report/quantity-of-province', {
            method: 'GET',
            urlParams: {
                creationTimeMin: new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString(),
                creationTimeMax: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59).toISOString(),
            }
        });
        this.setState({ datasOfProvince: list });
    }

    render(): React.ReactNode {
        const datasOfProvince = this.state.datasOfProvince.map(item => ({ ...item, key: item.key || '未知' }));
        const datasOfTag = this.state.datasOfTag.map(item => ({ ...item, key: item.key || '未知' }));
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
                            this.fetchDatasOfTag();
                            this.fetchDatasOfProvince();
                        })
                    }}
                />
            </div>
            <div className='flex gap-4 mt-4'>
                <div className='w-3/4 bg-white rounded shadow'>
                    <div className='p-4 text-lg font-semibold'>各省份访问量</div>
                    <Pie
                        height={400}
                        appendPadding={10}
                        data={datasOfProvince}
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
                    <Ranking datas={datasOfProvince} />
                </div>
            </div>
            <div className='flex gap-4 mt-4'>
                <div className='w-3/4 bg-white rounded shadow'>
                    <div className='p-4 text-lg font-semibold'>标签统计</div>
                    <Pie
                        height={400}
                        appendPadding={10}
                        data={datasOfTag}
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
                    <Ranking datas={datasOfTag} />
                </div>
            </div>
        </div>
    }
}