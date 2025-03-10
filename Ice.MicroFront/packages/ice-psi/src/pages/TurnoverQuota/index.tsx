import React from 'react';
import { Select, Space, Button, Typography } from 'antd';
import { LabelEX, exportXLSX } from 'ice-layout';
import { iceFetch, Tool } from 'ice-common'
import Bar from './Bar';

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

    exportFile = () => {
        // purchasesQuota: number,
        // purchaseReturnsQuota: number,
        // saleQuota: number,
        // saleReturnQuota: number,
        let datas = [
            { time: '时间', purchasesQuota: '采购额度', purchaseReturnsQuota: '采购退货额度', saleQuota: '销售单额度', saleReturnQuota: '门店退货额度' },
            ...this.state.turnoverQuotas
        ];
        exportXLSX(datas, undefined, 'turnover.xlsx');
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
            <div style={{ display: 'flex', gap: 8, backgroundColor: '#fff', padding: '8px 0px', alignItems: 'center' }}>
                <LabelEX text='统计方式'>
                    <Select
                        placeholder='选择统计方式'
                        style={{ width: 150 }}
                        value={this.state.type}
                        onChange={val => {
                            this.setState({ type: val }, () => {
                                this.fetchDatas();
                            });
                        }}
                    >
                        <Select.Option value='day'>日(最近 60 天)</Select.Option>
                        <Select.Option value='month'>月(最近 12 个月)</Select.Option>
                    </Select>
                </LabelEX>
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
                <Button onClick={this.exportFile}>导出</Button>
                <Typography.Text type='warning'>注：采购单统计"已完成"的订单，采购退货单统计"已完成"的订单，销售订单统计"已完成"的订单，门店退货单统计"已完成"的订单</Typography.Text>
            </div>
            <div style={{ backgroundColor: '#fff', padding: 20, marginTop: 10 }}>
                <Bar datas={barDatas} />
            </div>
            <Space size={16} style={{ backgroundColor: '#fa8c16', color: '#fff', padding: 10, width: '100%' }}>
                <span>总销售订单额：{saleTotal}</span>
                <span>总采购退货额：{purchaseReturnsTotal}</span>
                <span>总采购额：{purchaseTotal}</span>
                <span>总门店退货额：{saleReturnTotal}</span>
                <span>总营业额 = 总销售订单额 + 总采购退货额 - 总采购额 - 总门店退货额 = <span style={{ color: '#003a8c' }}>{(saleTotal + purchaseReturnsTotal - purchaseTotal - saleReturnTotal).toFixed(2)}</span></span>
            </Space>
        </div>
    }
}