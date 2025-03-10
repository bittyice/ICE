import React, { useEffect, useState } from 'react';
import { DatePicker, Tag, Space, Button, Selector, Form, SpinLoading } from 'antd-mobile';
import { DateRangePicker, LabelEX, IceFormList } from 'ice-mobile-layout';
import { iceFetch, Tool } from 'ice-common';
import { Column } from '@ant-design/plots';
import dayjs from 'dayjs';
import { IceStateType, PSIOtherApi, PaymentMethodEntity, paymentMethodSlice } from 'ice-core';
import { NumberOutlined, InfoOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';

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
        <div className='text-xl font-semibold mb-4'>{props.title}</div>
        <Column
            height={200}
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

    return <IceFormList
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
            title: '总营收',
            dataIndex: 'all',
            key: 'all',
            align: 'right',
            render: (val, row) => {
                return ((row.purchaseReturn?.feeTotal || 0) + (row.sale?.feeTotal || 0) - (row.purchase?.feeTotal || 0) - (row.saleReturn?.feeTotal || 0)).toFixed(2)
            }
        }, {
            title: '实际到账金额',
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
        dataSource={datas}
    />
}

export default class extends React.Component<Props> {
    state = {
        values: [null, null] as [Date | null, Date | null],
        showStartDate: false,
        showEndDate: false,
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
        this.state.values = [now, now];
    }

    componentDidMount(): void {
        this.fetchDatas();
    }

    fetchDatas = () => {
        const [startTime, endTime] = this.state.values;
        const start = new Date(startTime!.getFullYear(), startTime!.getMonth(), startTime!.getDate()).toISOString();
        const end = new Date(endTime!.getFullYear(), endTime!.getMonth(), endTime!.getDate(), 23, 59, 59).toISOString();
        PSIOtherApi.getAllFeeAnalyseAsync({
            startTime: start,
            endTime: end,
            isSettlement: this.state.isSettlement
        }).then((data) => {
            this.setState({ datas: data, paymentMethodTableKey: this.state.paymentMethodTableKey + 1 });
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
            <div className='w-full bg-white z-10 flex flex-col gap-4' style={{ padding: '10px 5px', borderRadius: 5 }}>
                <LabelEX text='时间范围'>
                    <DateRangePicker
                        value={this.state.values}
                        onChange={value => {
                            this.setState({ values: value }, () => {
                                this.fetchDatas();
                            });
                        }}
                    />
                </LabelEX>
                <LabelEX text='是否结算'>
                    <Selector
                        options={[
                            { label: '全部', value: 'a' },
                            { label: '是', value: 'y' },
                            { label: '否', value: 'n' },
                        ]}
                        value={[this.state.isSettlement == null ? 'a' : this.state.isSettlement == true ? 'y' : 'n']}
                        onChange={(val) => {
                            this.setState({ isSettlement: val[0] == 'a' ? null : val[0] == 'y' ? true : false }, () => {
                                this.fetchDatas();
                            });
                        }}
                    />
                </LabelEX>
            </div>
            <Form mode='card'>
                <Form.Item label='总营收'>
                    {((this.state.datas.purchaseReturn?.feeTotal || 0) + (this.state.datas.sale?.feeTotal || 0) - (this.state.datas.purchase?.feeTotal || 0) - (this.state.datas.saleReturn?.feeTotal || 0)).toFixed(2)} ￥
                </Form.Item>
                <Form.Item label='收入（销售费用 + 采购退货费用）'>
                    {(this.state.datas.purchaseReturn?.feeTotal || 0) + (this.state.datas.sale?.feeTotal || 0)}
                </Form.Item>
                <Form.Item label='支出（采购费用 + 销售退货费用）'>
                    {(this.state.datas.purchase?.feeTotal || 0) + (this.state.datas.saleReturn?.feeTotal || 0)}
                </Form.Item>

                <Form.Item label='采购费用'>
                    {(this.state.datas.purchase?.feeTotal || 0)}
                </Form.Item>
                <Form.Item label='采购退货费用'>
                    {(this.state.datas.purchaseReturn?.feeTotal || 0)}
                </Form.Item>
                <Form.Item label='销售费用'>
                    {(this.state.datas.sale?.feeTotal || 0)}
                </Form.Item>
                <Form.Item label='销售退货费用'>
                    {(this.state.datas.saleReturn?.feeTotal || 0)}
                </Form.Item>

                <Form.Item label='待支付采购费用'>
                    {((this.state.datas.purchase?.feeTotal || 0) - (this.state.datas.purchase?.feeTotalPaid || 0)).toFixed(2)} ￥
                </Form.Item>
                <Form.Item label='待支付销售费用'>
                    {((this.state.datas.sale?.feeTotal || 0) - (this.state.datas.sale?.feeTotalPaid || 0)).toFixed(2)} ￥
                </Form.Item>
            </Form>
            <div className='w-full flex mt-4'>
                {
                    this.state.paymentMethodTableKey > 0 ?
                        <PaymentMethodTable
                            key={this.state.paymentMethodTableKey}
                            purchase={this.state.datas.purchase?.paymentMethodDetails || []}
                            purchaseReturn={this.state.datas.purchaseReturn?.paymentMethodDetails || []}
                            sale={this.state.datas.sale?.paymentMethodDetails || []}
                            saleReturn={this.state.datas.saleReturn?.paymentMethodDetails || []}
                        />
                        : <SpinLoading />
                }
            </div>
            <div className='mt-4'>
                <RateItem datas={orderTotals} title='订单总数' />
            </div>
            <div className='mt-4'>
                <RateItem datas={skuTotals} title='SKU总数' />
            </div>
            <div style={{ marginTop: 16 }}>
                <RateItem datas={feeTotals} title='总费用' />
            </div>
        </div>
    }
}