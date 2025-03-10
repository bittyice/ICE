import React from 'react';
import { Typography, Card, Divider, Row, Col, message, DatePicker, Tag, Table, Button, Space, Input, Popover } from 'antd';
import { NumberOutlined, PrinterOutlined } from '@ant-design/icons';
import { CompanyEntity, SaleReturnOrderApi, SaleReturnOrderEntity, TenantApi, ProductInfoHelper, PaymentMethodEntity } from 'ice-core';
import { Tool } from 'ice-common';
import { PrintDatas } from 'ice-layout';

let { Title } = Typography;

class PrintOutboundOrder extends React.Component<{
    paymentMethods: Array<PaymentMethodEntity>,
    entity: any,
    company: any
}> {
    state = {
        total: 0
    }

    columns = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val: any, row: any, index: number) => {
            return index + 1;
        }
    }, {
        title: 'Sku',
        key: 'sku',
        dataIndex: 'sku',
        width: 200,
    }, {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
        width: 100,
        render: (val: any, row: any, index: number) => {
            return ProductInfoHelper.skuToProducts[row.sku]?.name;
        }
    }, {
        title: '单价',
        key: 'unitPrice',
        dataIndex: 'unitPrice',
        width: 100,
        render: (val: any, row: any, index: number) => {
            return `${val} 元`;
        }
    }, {
        title: '计量单位',
        key: 'unit',
        dataIndex: 'unit',
        width: 100,
        render: (val: any, row: any, index: number) => {
            return ProductInfoHelper.skuToProducts[row.sku]?.unit;
        }
    }, {
        title: '数量',
        key: 'quantity',
        dataIndex: 'quantity',
        width: 100,
    }, {
        title: '合计金额',
        key: 'quantity',
        dataIndex: 'quantity',
        width: 100,
        render: (val: any, row: any, index: number) => {
            return `${row.quantity * row.unitPrice} 元`;
        }
    }]

    componentDidMount() {
        this.setState({
            total: Tool.sum(this.props.entity.details.map((item: any) => item.quantity))
        });
    }

    render(): React.ReactNode {
        let total = 0;
        for (let detail of this.props.entity.details) {
            total = total + detail.quantity * detail.unitPrice;
        }
        return <div className='sale-return-order-print' style={{ padding: '5mm', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ zIndex: 999 }}>
                    <div>退货单号：{this.props.entity.orderNumber}</div>
                    <div>商户电话：{this.props.company.phone}</div>
                    <div>{`商户地址：${[this.props.company.province, this.props.company.city, this.props.company.town].filter(e => e).join(' / ')} ${this.props.company.addressDetail || ''}`}</div>
                </div>
                <div style={{ position: 'absolute', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', top: -3 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{this.props.company.name || ''} 退货单</div>
                    <div>打印时间：{Tool.dateFormat(new Date())}</div>
                </div>
                <div style={{ zIndex: 999 }}>
                    <div style={{ textAlign: 'right' }}>退货总额：{total} 元</div>
                    <div style={{ textAlign: 'right' }}>实退金额：{this.props.entity.totalPrice} 元</div>
                </div>
            </div>
            <table style={{ width: '100%' }} className='sale-return-order-print-table'>
                <tr>
                    {
                        this.columns.map(item => (<th>{item.title}</th>))
                    }
                </tr>
                {
                    this.props.entity.details.map((detail: any, index: number) => {
                        return <tr>
                            {
                                this.columns.map(col => {
                                    let value = undefined;

                                    if (col.dataIndex) {
                                        value = detail[col.dataIndex]
                                    }

                                    if (col.render) {
                                        return <td width={col.width}>{col.render(value, detail, index)}</td>;
                                    }

                                    return <td width={col.width}>{value}</td>;
                                })
                            }
                        </tr>
                    })
                }
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <div style={{ width: '60mm' }}>{'负责人（签名/盖章）：'}</div>
                <div style={{ width: '60mm' }}>{'签收人（签名/盖章）：'}</div>
            </div>
            <div style={{ display: 'flex', marginTop: 8 }}>
                支付方式：{this.props.paymentMethods.find(e => e.id === this.props.entity.paymentMethodId)?.name || '--'}
            </div>
        </div>
    }
}

class OutboundPrint extends React.Component<{
    paymentMethods: Array<PaymentMethodEntity>,
    orders: Array<SaleReturnOrderEntity>
}>  {
    printDatasRef: PrintDatas | null = null;

    state = {
        orders: [] as Array<SaleReturnOrderEntity>,
        company: {} as CompanyEntity,
        printDatasKey: 0,
    }

    componentDidMount(): void {
        TenantApi.getCompany().then(company => {
            this.setState({
                company: company || {}
            });
        });
    }

    fetchOutbounds = async () => {
        if (this.props.orders.length === 0) {
            message.warning('请选择订单');
            return;
        }

        try {
            let datas = await SaleReturnOrderApi.getListForIds({
                ids: this.props.orders.map(e => e.id!)
            });
            this.setState({ orders: datas });
            let skus: Array<string> = [];
            datas.forEach(data => {
                data.details!.forEach((detail: any) => {
                    if (!skus.some(e => e == detail.sku)) {
                        skus.push(detail.sku);
                    }
                });
            });

            await ProductInfoHelper.fetchProducts(skus);
        } catch { }
        this.setState({ printDatasKey: this.state.printDatasKey + 1 });
        setTimeout(() => {
            this.printDatasRef?.print();
        }, 1);
    }

    render(): React.ReactNode {
        return <div>
            <Button type='link' onClick={this.fetchOutbounds}>打印</Button>
            <PrintDatas
                key={this.state.printDatasKey}
                ref={r => this.printDatasRef = r}
                printDatas={this.state.orders.map(item => <PrintOutboundOrder
                    paymentMethods={this.props.paymentMethods}
                    entity={item}
                    company={this.state.company}
                />)}
            />
        </div>
    }
}

export default OutboundPrint;