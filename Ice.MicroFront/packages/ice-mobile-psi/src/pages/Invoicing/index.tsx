import React from 'react';
import { ActionSelect, IceFormList, LabelEX } from 'ice-mobile-layout';
import { iceFetch, Tool } from 'ice-common';
import { ProductInfoEntity, ProductInfoApi } from 'ice-core';
import { Space } from 'antd-mobile'

type InvoicingDataType = {
    /// <summary>
    /// Sku
    /// </summary>
    sku: string,
    /// <summary>
    /// 名称
    /// </summary>
    name: string,
    /// <summary>
    /// 单位
    /// </summary>
    unit: string | undefined,
    /// <summary>
    /// 成本价
    /// </summary>
    cost: number,
    /// <summary>
    /// 期初库存
    /// </summary>
    startStock: number,
    /// <summary>
    /// 期初金额
    /// </summary>
    startAmount: number,
    /// <summary>
    /// 销售数量
    /// </summary>
    saleQuantity: number,
    /// <summary>
    /// 销售金额
    /// </summary>
    saleAmount: number,
    /// <summary>
    /// 入库数量
    /// </summary>
    inboundQuantity: number,
    /// <summary>
    /// 入库金额
    /// </summary>
    inboundAmount: number,
    /// <summary>
    /// 结余库存
    /// </summary>
    endStock: number,
    /// <summary>
    /// 结余金额
    /// </summary>
    endAmount: number,
    /// <summary>
    /// 销售成本
    /// </summary>
    saleCost: number,
    /// <summary>
    /// 销售毛利
    /// </summary>
    saleProfit: number,
};
type MonthType = { key: string, year: number, month: number };

class Invoicing extends React.Component<{}> {
    showMonths: Array<MonthType>;
    productInfos: Array<ProductInfoEntity> = [];

    state = {
        loading: false,
        selectMonthKey: null as (string | null),
        invoicionDatas: [] as Array<InvoicingDataType>
    }

    constructor(props: any) {
        super(props);
        let now = new Date();
        // 月初
        let monthStart = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
        this.showMonths = [];
        for (let n = 1; n <= 18; n++) {
            monthStart.setMonth(monthStart.getMonth() - 1);
            let year = monthStart.getFullYear();
            let month = monthStart.getMonth() + 1;
            this.showMonths.unshift({ key: `${year}-${month}`, year: year, month: month });
        }
        this.state.selectMonthKey = this.showMonths[this.showMonths.length - 1].key;
    }

    componentDidMount(): void {
        this.fetchAllProducts().then(() => {
            return this.fetchInvoicions();;
        });
    }

    fetchAllProducts = () => {
        return ProductInfoApi.getAll().then(datas => {
            // 不统计货主的进销存
            this.productInfos = datas;
        });
    }

    fetchInvoicions = () => {
        if (!this.state.selectMonthKey) {
            return;
        }

        let month = this.showMonths.find(e => e.key == this.state.selectMonthKey);
        if (!month) {
            return;
        }

        let preMonth = new Date(month.year, month.month - 1, 1);
        this.setState({ loading: true });
        return Promise.all([
            // 当前进销存
            iceFetch<Array<any>>(`/api/psi/invoicing/month-invoicings`, {
                method: 'GET',
                urlParams: {
                    year: month.year,
                    month: month.month
                }
            }),
            // 上个月的进销存
            iceFetch<Array<any>>(`/api/psi/invoicing/month-invoicings`, {
                method: 'GET',
                urlParams: {
                    year: preMonth.getFullYear(),
                    month: preMonth.getMonth()
                }
            })
        ]).then(arr => {
            const [curDatas, preDatas] = arr as [Array<any>, Array<any>];
            let invoicionDatas: Array<InvoicingDataType> = [];

            for (let product of this.productInfos) {
                let preData = preDatas.find((e) => e.sku == product.sku);
                let curData = curDatas.find(e => e.sku == product.sku);
                let invoicionData: InvoicingDataType = {
                    sku: product.sku!,
                    name: product.name!,
                    unit: product.unit,
                    cost: 0,
                    startStock: preData?.endStock || 0,
                    startAmount: preData?.endAmount || 0,
                    saleQuantity: curData?.saleQuantity || 0,
                    saleAmount: curData?.saleAmount || 0,
                    inboundQuantity: curData?.inboundQuantity || 0,
                    inboundAmount: curData?.inboundAmount || 0,
                    endStock: curData?.endStock || 0,
                    endAmount: curData?.endAmount || 0,
                    saleCost: 0,
                    saleProfit: 0,
                };

                let totalQuantity = invoicionData.startStock + invoicionData.inboundQuantity;
                if (totalQuantity > 0) {
                    invoicionData.cost = (invoicionData.startAmount + invoicionData.inboundAmount) / totalQuantity;
                }
                invoicionData.saleCost = invoicionData.cost * invoicionData.saleQuantity;
                invoicionData.saleProfit = invoicionData.saleAmount - invoicionData.saleCost;
                invoicionDatas.push(invoicionData);
            }

            this.setState({ invoicionDatas: invoicionDatas });
        }).finally(() => {
            this.setState({ loading: false });
        });
    };

    render(): React.ReactNode {
        return <div>
            <Space className='p-2 bg-white w-full'>
                <LabelEX text='统计月份'>
                    <ActionSelect
                        options={this.showMonths.map(item => ({ label: item.key, value: item.key }))}
                        value={this.state.selectMonthKey || ''}
                        onChange={val => {
                            this.setState({ selectMonthKey: val }, () => {
                                this.fetchInvoicions();
                            });
                        }}
                    />
                </LabelEX>
            </Space>
            <div style={{ marginTop: 10 }}>
                <IceFormList
                    columns={[{
                        title: 'SKU',
                        dataIndex: 'sku',
                        key: 'sku',
                        fixed: 'left'
                    }, {
                        title: '产品名',
                        dataIndex: 'name',
                        key: 'name'
                    }, {
                        title: '计量单位',
                        dataIndex: 'unit',
                        key: 'unit'
                    }, {
                        title: '成本价',
                        dataIndex: 'cost',
                        key: 'cost',
                        render: (val) => {
                            return val.toFixed(2);
                        }
                    }, {
                        title: '期初库存',
                        dataIndex: 'startStock',
                        key: 'startStock'
                    }, {
                        title: '期初金额',
                        dataIndex: 'startAmount',
                        key: 'startAmount',
                        render: (val) => {
                            return val.toFixed(2);
                        }
                    }, {
                        title: '销售数量',
                        dataIndex: 'saleQuantity',
                        key: 'saleQuantity'
                    }, {
                        title: '销售金额',
                        dataIndex: 'saleAmount',
                        key: 'saleAmount',
                        render: (val) => {
                            return val.toFixed(2);
                        }
                    }, {
                        title: '进货数量',
                        dataIndex: 'inboundQuantity',
                        key: 'inboundQuantity'
                    }, {
                        title: '进货金额',
                        dataIndex: 'inboundAmount',
                        key: 'inboundAmount',
                        render: (val) => {
                            return val.toFixed(2);
                        }
                    }, {
                        title: '结余库存',
                        dataIndex: 'endStock',
                        key: 'endStock'
                    }, {
                        title: '结余金额',
                        dataIndex: 'endAmount',
                        key: 'endAmount',
                        render: (val) => {
                            return val.toFixed(2);
                        }
                    }, {
                        title: '销售成本',
                        dataIndex: 'saleCost',
                        key: 'saleCost',
                        render: (val) => {
                            return val.toFixed(2);
                        }
                    }, {
                        title: '销售毛利',
                        dataIndex: 'saleProfit',
                        key: 'saleProfit',
                        fixed: 'right',
                        render: (val) => {
                            return val.toFixed(2);
                        }
                    }]}
                    dataSource={this.state.invoicionDatas}
                />
            </div>
        </div>
    }
}

export default Invoicing;