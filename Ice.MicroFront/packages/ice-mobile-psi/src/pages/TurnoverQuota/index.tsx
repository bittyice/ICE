import React from 'react';
import { Selector, Space, Form } from 'antd-mobile';
import { LabelEX } from 'ice-mobile-layout';
import { iceFetch, Tool } from 'ice-common'
import { Column } from '@ant-design/plots';

type TurnoverQuotaType = {
    time: string,
    purchasesQuota: number,
    purchaseReturnsQuota: number,
    saleQuota: number,
    saleReturnQuota: number,
}

export default class extends React.Component {
    state = {
        type: 'day' as ('day' | 'month'),
        turnoverQuotas: [] as Array<TurnoverQuotaType>,
        isSettlement: null as (boolean | null)
    }

    constructor(props: any) {
        super(props);
    }

    componentDidMount(): void {
        this.fetchTurnoverQuotaOfDay();
    }

    buildTurnoverQuotasForDay = () => {
        let turnoverQuotas = [] as Array<TurnoverQuotaType>;
        let now = new Date();
        now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        for (let n = 0; n < 61; n++) {
            turnoverQuotas.unshift({
                time: Tool.dateFormat(now, 'yyyy-MM-dd')!,
                purchasesQuota: 0,
                purchaseReturnsQuota: 0,
                saleQuota: 0,
                saleReturnQuota: 0,
            });
            now.setDate(now.getDate() - 1);
        }
        return turnoverQuotas;
    }

    buildTurnoverQuotasForMonth = () => {
        let turnoverQuotas = [] as Array<TurnoverQuotaType>;
        let now = new Date();
        now = new Date(now.getFullYear(), now.getMonth());
        for (let n = 0; n < 13; n++) {
            turnoverQuotas.unshift({
                time: Tool.dateFormat(now, 'yyyy-MM')!,
                purchasesQuota: 0,
                purchaseReturnsQuota: 0,
                saleQuota: 0,
                saleReturnQuota: 0,
            });
            now.setMonth(now.getMonth() - 1);
        }
        return turnoverQuotas;
    }

    fetchTurnoverQuotaOfDay = () => {
        return iceFetch<any>('/api/psi/report/turnover-quota-of-day', {
            method: 'GET',
            urlParams: {
                isSettlement: this.state.isSettlement
            }
        }).then((omsDatas) => {
            let turnoverQuotas = this.buildTurnoverQuotasForDay();

            omsDatas.purchases.forEach((item: any) => {
                item.time = Tool.dateFormat(new Date(item.year, item.month - 1, item.day), 'yyyy-MM-dd');
            });
            omsDatas.purchaseReturns.forEach((item: any) => {
                item.time = Tool.dateFormat(new Date(item.year, item.month - 1, item.day), 'yyyy-MM-dd');
            });
            omsDatas.sales.forEach((item: any) => {
                item.time = Tool.dateFormat(new Date(item.year, item.month - 1, item.day), 'yyyy-MM-dd');
            });
            omsDatas.returns.forEach((item: any) => {
                item.time = Tool.dateFormat(new Date(item.year, item.month - 1, item.day), 'yyyy-MM-dd');
            });

            turnoverQuotas.forEach(item => {
                let purchase = omsDatas.purchases.find((e: any) => item.time == e.time);
                let purchaseReturn = omsDatas.purchaseReturns.find((e: any) => item.time == e.time);
                let sale = omsDatas.sales.find((e: any) => item.time == e.time);
                let returngoods = omsDatas.returns.find((e: any) => item.time == e.time);
                item.purchasesQuota = purchase ? purchase.quota : 0;
                item.purchaseReturnsQuota = purchaseReturn ? purchaseReturn.quota : 0;
                item.saleQuota = sale ? sale.quota : 0;
                item.saleReturnQuota = returngoods ? returngoods.quota : 0;
            });
            this.setState({ turnoverQuotas: turnoverQuotas });
        });
    }

    fetchTurnoverQuotaOfMonth = () => {
        return iceFetch<any>('/api/psi/report/turnover-quota-of-month', {
            method: 'GET',
            urlParams: {
                isSettlement: this.state.isSettlement
            }
        }).then(omsDatas => {
            let turnoverQuotas = this.buildTurnoverQuotasForMonth();

            omsDatas.purchases.forEach((item: any) => {
                item.time = Tool.dateFormat(new Date(item.year, item.month - 1, item.day), 'yyyy-MM');
            });
            omsDatas.purchaseReturns.forEach((item: any) => {
                item.time = Tool.dateFormat(new Date(item.year, item.month - 1, item.day), 'yyyy-MM');
            });
            omsDatas.sales.forEach((item: any) => {
                item.time = Tool.dateFormat(new Date(item.year, item.month - 1, item.day), 'yyyy-MM');
            });
            omsDatas.returns.forEach((item: any) => {
                item.time = Tool.dateFormat(new Date(item.year, item.month - 1, item.day), 'yyyy-MM');
            });

            turnoverQuotas.forEach(item => {
                let purchase = omsDatas.purchases.find((e: any) => item.time == e.time);
                let purchaseReturn = omsDatas.purchaseReturns.find((e: any) => item.time == e.time);
                let sale = omsDatas.sales.find((e: any) => item.time == e.time);
                let returngoods = omsDatas.returns.find((e: any) => item.time == e.time);
                item.purchasesQuota = purchase ? purchase.quota : 0;
                item.purchaseReturnsQuota = purchaseReturn ? purchaseReturn.quota : 0;
                item.saleQuota = sale ? sale.quota : 0;
                item.saleReturnQuota = returngoods ? returngoods.quota : 0;
            });
            this.setState({ turnoverQuotas: turnoverQuotas });
        });
    }

    fetchDatas = () => {
        if (this.state.type == 'day') {
            return this.fetchTurnoverQuotaOfDay();
        }
        else {
            return this.fetchTurnoverQuotaOfMonth();
        }
    }

    render(): React.ReactNode {
        let purchaseTotal = 0;
        let purchaseReturnsTotal = 0;
        let saleTotal = 0;
        let saleReturnTotal = 0;
        let barDatas = [] as Array<{ label: string, value: number, type: string }>;
        this.state.turnoverQuotas.forEach(item => {
            purchaseTotal = purchaseTotal + item.purchasesQuota;
            purchaseReturnsTotal = purchaseReturnsTotal + item.purchaseReturnsQuota;
            saleTotal = saleTotal + item.saleQuota;
            saleReturnTotal = saleReturnTotal + item.saleReturnQuota;
            barDatas.push({
                label: item.time,
                value: item.saleQuota,
                type: '销售订单'
            });
            barDatas.push({
                label: item.time,
                value: item.purchaseReturnsQuota,
                type: '采购退货单'
            });
            barDatas.push({
                label: item.time,
                value: item.purchasesQuota,
                type: '采购单'
            });
            barDatas.push({
                label: item.time,
                value: item.saleReturnQuota,
                type: '门店退货单'
            });
        });


        return <div>
            <div className='flex flex-col gap-2 bg-white p-2'>
                <LabelEX text='统计方式'>
                    <Selector
                        options={[
                            { label: '日(最近 60 天)', value: 'day' },
                            { label: '月(最近 12 个月)', value: 'month' },
                        ]}
                        value={[this.state.type]}
                        onChange={val => {
                            this.setState({ type: val[0] }, () => {
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
                <Form.Item label='总销售订单额'>
                    {saleTotal} ￥
                </Form.Item>
                <Form.Item label='总采购退货额'>
                    {purchaseReturnsTotal} ￥
                </Form.Item>
                <Form.Item label='总采购额'>
                    {purchaseTotal} ￥
                </Form.Item>
                <Form.Item label='总门店退货额'>
                    {saleReturnTotal} ￥
                </Form.Item>
                <Form.Item label='总营业额'>
                    {(saleTotal + purchaseReturnsTotal - purchaseTotal - saleReturnTotal).toFixed(2)} ￥
                </Form.Item>
            </Form>
            <div style={{ backgroundColor: '#fff', padding: 20, marginTop: 10 }}>
                <Column
                    xField='label'
                    yField='value'
                    seriesField='type'
                    isGroup={true}
                    data={barDatas}
                    height={250}
                />
            </div>
        </div>
    }
}