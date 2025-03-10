import React, { useEffect, useState } from 'react';
import { DatePicker, Typography, Tag, Space, Select, Button, Descriptions, Table, Spin } from 'antd';
import { LabelEX, Help, ButtonHelp } from 'ice-layout';
import { iceFetch, Tool } from 'ice-common';
import { Column } from '@ant-design/plots';
import dayjs from 'dayjs';
import { IceStateType, PSIOtherApi, PaymentMethodEntity, paymentMethodSlice } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import { NumberOutlined, InfoOutlined } from '@ant-design/icons';

type Props = {};

type PaymentMethodDetailType = { paymentMethodId: string, feeTotal: number, feeTotalPaid: number }

type AnalyseType = {
    orderTotal: number,
    skuTotal: number,
    feeTotal: number,
    feeTotalPaid: number,
    paymentMethodDetails: Array<PaymentMethodDetailType>
}

const RateItem = (props: { datas: Array<any>, title: string }) => {
    return <div style={{ width: '100%', backgroundColor: '#fff', padding: 20, borderRadius: 10, position: 'relative' }}>
        <div style={{
            width: 80,
            height: 80,
            backgroundColor: `#00000010`,
            borderRadius: 100,
            position: 'absolute',
            bottom: 0,
            right: 0
        }} />
        <div style={{
            width: 150,
            height: 150,
            backgroundColor: '#722ed110',
            borderRadius: 100,
            position: 'absolute',
            bottom: 40,
            right: 20
        }} />
        <Typography.Title level={5}>{props.title}</Typography.Title>
        <Column
            height={250}
            data={props.datas}
            xField='type'
            yField='value'
        />
    </div>
}

const PaymentMethodTable = (props: {
    purchase: Array<PaymentMethodDetailType>,
    purchaseReturn: Array<PaymentMethodDetailType>,
    sale: Array<PaymentMethodDetailType>,
    saleReturn: Array<PaymentMethodDetailType>,
}) => {
    const paymentMethods: Array<PaymentMethodEntity> = useSelector((state: IceStateType) => state.paymentMethod.allDatas) || [];
    const [datas, setDatas] = useState<Array<any>>([]);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(paymentMethodSlice.asyncActions.fetchAllDatas({}) as any);
    }, [])

    useEffect(() => {
        let datas: Array<any> = [];

        for (let paymentMethod of paymentMethods) {
            let data: any = {};
            data.name = paymentMethod.name;
            data.purchase = props.purchase.find(e => e.paymentMethodId === paymentMethod.id);
            data.purchaseReturn = props.purchaseReturn.find(e => e.paymentMethodId === paymentMethod.id);
            data.sale = props.sale.find(e => e.paymentMethodId === paymentMethod.id);
            data.saleReturn = props.saleReturn.find(e => e.paymentMethodId === paymentMethod.id);
            datas.push(data);
        }

        let data: any = {};
        data.name = '系统默认';
        data.purchase = props.purchase.find(e => e.paymentMethodId === null);
        data.purchaseReturn = props.purchaseReturn.find(e => e.paymentMethodId === null);
        data.sale = props.sale.find(e => e.paymentMethodId === null);
        data.saleReturn = props.saleReturn.find(e => e.paymentMethodId === null);
        datas.push(data);

        setDatas(datas);
    }, [paymentMethods]);

    return <Table
        className='w-full'
        pagination={false}
        dataSource={datas}
        bordered
        columns={[{
            title: <NumberOutlined />,
            key: 'index',
            fixed: 'left',
            width: 40,
            render: (val, row, index) => {
                return index + 1;
            }
        }, {
            title: '付款渠道',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: <div>
                <span>总营收</span>
                <Help title='说明' body='销售费用 + 采购退货费用 - 采购费用 - 销售退货费用'><Button size='small' type='link' icon={<InfoOutlined />}></Button></Help>
            </div>,
            dataIndex: 'all',
            key: 'all',
            align: 'right',
            render: (val, row) => {
                return ((row.purchaseReturn?.feeTotal || 0) + (row.sale?.feeTotal || 0) - (row.purchase?.feeTotal || 0) - (row.saleReturn?.feeTotal || 0)).toFixed(2)
            }
        }, {
            title: <div>
                <span>实际到账金额</span>
                <Help title='说明' body='销售费用已支付 + 采购退货费用 - 采购费用已支付 - 销售退货费用'><Button size='small' type='link' icon={<InfoOutlined />}></Button></Help>
            </div>,
            dataIndex: 'all2',
            key: 'all2',
            align: 'right',
            render: (val, row) => {
                return ((row.purchaseReturn?.feeTotal || 0) + (row.sale?.feeTotalPaid || 0) - (row.purchase?.feeTotalPaid || 0) - (row.saleReturn?.feeTotal || 0)).toFixed(2)
            }
        }, {
            title: '采购',
            dataIndex: 'purchase',
            key: 'purchase',
            align: 'right',
            render: (val, row) => {
                return row.purchase?.feeTotal || 0
            }
        }, {
            title: '采购-已支付',
            dataIndex: 'purchasePaid',
            key: 'purchasePaid',
            align: 'right',
            render: (val, row) => {
                return row.purchase?.feeTotalPaid || 0
            }
        }, {
            title: '采购退货',
            dataIndex: 'purchaseReturn',
            key: 'purchaseReturn',
            align: 'right',
            render: (val, row) => {
                return row.purchaseReturn?.feeTotal || 0
            }
        }, {
            title: '销售',
            dataIndex: 'sale',
            key: 'sale',
            align: 'right',
            render: (val, row) => {
                return row.sale?.feeTotal || 0
            }
        }, {
            title: '销售-已支付',
            dataIndex: 'salePaid',
            key: 'salePaid',
            align: 'right',
            render: (val, row) => {
                return row.sale?.feeTotalPaid || 0
            }
        }, {
            title: '销售退货',
            dataIndex: 'saleReturn',
            key: 'saleReturn',
            align: 'right',
            render: (val, row) => {
                return row.saleReturn?.feeTotal || 0
            }
        }]}
    />
}

export default class extends React.Component<Props> {
    state = {
        values: [null, null] as [dayjs.Dayjs | null, dayjs.Dayjs | null],
        isSettlement: null as (boolean | null),
        datas: {
            purchase: null as (AnalyseType | null),
            purchaseReturn: null as (AnalyseType | null),
            sale: null as (AnalyseType | null),
            saleReturn: null as (AnalyseType | null),
        },
        paymentMethodTableKey: 0,
    }

    constructor(props: Props) {
        super(props);

        let now = new Date();
        this.state.values = [dayjs(now), dayjs(now)];
    }

    componentDidMount(): void {
        this.fetchDatas();
    }

    fetchDatas = () => {
        const [startTime, endTime] = this.state.values;
        const stime = startTime!.toDate();
        const eTime = endTime!.toDate();
        const start = new Date(stime!.getFullYear(), stime!.getMonth(), stime!.getDate()).toISOString();
        const end = new Date(eTime!.getFullYear(), eTime!.getMonth(), eTime!.getDate(), 23, 59, 59).toISOString();
        PSIOtherApi.getAllFeeAnalyseAsync({
            startTime: start,
            endTime: end,
            isSettlement: this.state.isSettlement
        }).then((datas) => {
            this.setState({
                datas: datas,
                paymentMethodTableKey: this.state.paymentMethodTableKey + 1
            });
        });
    }

    render(): React.ReactNode {
        let orderTotals = [{
            value: this.state.datas.purchase?.orderTotal,
            type: '采购'
        }, {
            value: this.state.datas.purchaseReturn?.orderTotal,
            type: '采购退货'
        }, {
            value: this.state.datas.sale?.orderTotal,
            type: '销售订单'
        }, {
            value: this.state.datas.saleReturn?.orderTotal,
            type: '销售退货'
        }];

        let skuTotals = [{
            value: this.state.datas.purchase?.skuTotal,
            type: '采购'
        }, {
            value: this.state.datas.purchaseReturn?.skuTotal,
            type: '采购退货'
        }, {
            value: this.state.datas.sale?.skuTotal,
            type: '销售订单'
        }, {
            value: this.state.datas.saleReturn?.skuTotal,
            type: '销售退货'
        }];

        let feeTotals = [{
            value: this.state.datas.purchase?.feeTotal,
            type: '采购'
        }, {
            value: this.state.datas.purchase?.feeTotalPaid,
            type: '采购-已支付'
        }, {
            value: this.state.datas.purchaseReturn?.feeTotal,
            type: '采购退货'
        }, {
            value: this.state.datas.sale?.feeTotal,
            type: '销售订单'
        }, {
            value: this.state.datas.sale?.feeTotalPaid,
            type: '销售订单-已支付'
        }, {
            value: this.state.datas.saleReturn?.feeTotal,
            type: '销售退货'
        }];

        return <div style={{ width: '100%' }}>
            <div className='w-full bg-white z-10 flex gap-2 top-0 left-0' style={{ padding: '10px 5px', borderRadius: 5 }}>
                <LabelEX text='时间范围'>
                    <DatePicker.RangePicker
                        allowClear={false}
                        value={this.state.values}
                        onChange={vals => {
                            this.setState({ values: vals }, () => {
                                this.fetchDatas();
                            });
                        }}
                    />
                </LabelEX>
                <Button onClick={() => {
                    let now = new Date();
                    this.setState({
                        values: [dayjs(now), dayjs(now)]
                    }, () => {
                        this.fetchDatas();
                    });
                }}>今天</Button>
                <Button onClick={() => {
                    let now = new Date();
                    let start = new Date(now.getFullYear(), now.getMonth(), 1);
                    this.setState({
                        values: [dayjs(start), dayjs(now)]
                    }, () => {
                        this.fetchDatas();
                    });
                }}>本月</Button>
                <LabelEX text='是否结算'>
                    <Select
                        style={{ width: 200 }}
                        placeholder='请选择'
                        allowClear
                        value={this.state.isSettlement}
                        onChange={(val) => {
                            this.setState({ isSettlement: val }, () => {
                                this.fetchDatas();
                            });
                        }}
                    >
                        <Select.Option value={false}>否</Select.Option>
                        <Select.Option value={true}>是</Select.Option>
                    </Select>
                </LabelEX>
            </div>
            <Descriptions
                column={4}
                className='mt-4 bg-white'
                bordered
                layout='vertical'
            >
                <Descriptions.Item span={2} label='总营收（销售费用 + 采购退货费用 - 采购费用 - 销售退货费用）'>
                    {((this.state.datas.purchaseReturn?.feeTotal || 0) + (this.state.datas.sale?.feeTotal || 0) - (this.state.datas.purchase?.feeTotal || 0) - (this.state.datas.saleReturn?.feeTotal || 0)).toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label='收入（销售费用 + 采购退货费用）'>
                    {(this.state.datas.purchaseReturn?.feeTotal || 0) + (this.state.datas.sale?.feeTotal || 0)}
                </Descriptions.Item>
                <Descriptions.Item label='支出（采购费用 + 销售退货费用）'>
                    {(this.state.datas.purchase?.feeTotal || 0) + (this.state.datas.saleReturn?.feeTotal || 0)}
                </Descriptions.Item>

                <Descriptions.Item label='采购费用'>
                    {(this.state.datas.purchase?.feeTotal || 0)}
                </Descriptions.Item>
                <Descriptions.Item label='采购退货费用'>
                    {(this.state.datas.purchaseReturn?.feeTotal || 0)}
                </Descriptions.Item>
                <Descriptions.Item label='销售费用'>
                    {(this.state.datas.sale?.feeTotal || 0)}
                </Descriptions.Item>
                <Descriptions.Item label='销售退货费用'>
                    {(this.state.datas.saleReturn?.feeTotal || 0)}
                </Descriptions.Item>

                <Descriptions.Item span={2} label='待支付采购费用（采购费用 - 采购费用已支付）'>
                    {(this.state.datas.purchase?.feeTotal || 0) - (this.state.datas.purchase?.feeTotalPaid || 0)}
                </Descriptions.Item>
                <Descriptions.Item span={2} label='待支付销售费用（销售费用 - 销售费用已支付）'>
                    {(this.state.datas.sale?.feeTotal || 0) - (this.state.datas.sale?.feeTotalPaid || 0)}
                </Descriptions.Item>
            </Descriptions>
            <div className='w-full flex justify-center mt-4'>
                {
                    this.state.paymentMethodTableKey > 0 ?
                        <PaymentMethodTable
                            key={this.state.paymentMethodTableKey}
                            purchase={this.state.datas.purchase?.paymentMethodDetails || []}
                            purchaseReturn={this.state.datas.purchaseReturn?.paymentMethodDetails || []}
                            sale={this.state.datas.sale?.paymentMethodDetails || []}
                            saleReturn={this.state.datas.saleReturn?.paymentMethodDetails || []}
                        />
                        : <Spin size='large' />
                }
            </div>
            <div style={{ width: '100%', display: 'flex', marginTop: 10, gap: 16 }}>
                <div className='flex-grow flex-shrink w-1/4'>
                    <RateItem datas={orderTotals} title='订单总数' />
                </div>
                <div className='flex-grow flex-shrink w-1/4'>
                    <RateItem datas={skuTotals} title='SKU总数' />
                </div>
                <div className='flex-grow flex-shrink w-2/4'>
                    <RateItem datas={feeTotals} title='总费用' />
                </div>
            </div>
            <div className='p-4'>
                注：采购统计"已完成"的订单，采购退货统计"已完成"的订单，销售订单统计"已完成"的订单，销售退货统计"已完成"的订单
            </div>
        </div>
    }
}