import React from 'react';
import { Typography, Card, Divider, Row, Col, message, DatePicker, Tag, Table, Button, Space, Input, Popover } from 'antd';
import { NumberOutlined, PrinterOutlined } from '@ant-design/icons';
import { Tool } from 'ice-common';
import { CompanyEntity, consts, IceStateType, SaleOrderApi, SaleOrderEntity, TenantApi, ProductInfoHelper, OutboundOrderApi } from 'ice-core';
import { PrintDatas } from 'ice-layout';
import JsBarcode from 'jsbarcode';

let { Title } = Typography;

class PrintOutboundOrder extends React.Component<{
    entity: any,
}> {
    id: string = `_outboundorder_${Tool.random() * 99999999}`;

    state = {
        total: 0
    }

    columns = [
        {
            title: <NumberOutlined />,
            key: '1',
            fixed: 'left',
            width: 50,
            render: (val: any, row: any, index: number) => {
                return index + 1;
            }
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: '名称',
            key: 'name',
            dataIndex: 'name',
            render: (val: any, row: any) => {
                return ProductInfoHelper.skuToProducts[row.sku]?.name;
            }
        },
        {
            title: '计量单位',
            key: 'unit',
            dataIndex: 'unit',
            render: (val: any, row: any) => {
                return ProductInfoHelper.skuToProducts[row.sku]?.unit;
            }
        },
        {
            title: '数量',
            dataIndex: 'quantity',
            key: 'quantity',
        },
    ];

    componentDidMount() {
        setTimeout(() => {
            try {
                JsBarcode(`#${this.id}`, this.props.entity.outboundNumber);
            }
            catch (ex: any) {
                console.error(ex);
                message.error('条形码生成错误');
            }
        }, 1);

        this.setState({
            total: Tool.sum(this.props.entity.outboundDetails.map((item: any) => item.quantity))
        });
    }

    render(): React.ReactNode {
        return <div style={{ padding: '5mm' }}>
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: '50%' }}>
                    <div>出库单号：{this.props.entity.outboundNumber}</div>
                    <div>出库数量：{this.state.total}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'absolute' }}>
                    <h2>出库单</h2>
                    <div>打印时间：{Tool.dateFormat(new Date())}</div>
                </div>
                <div style={{ width: '50%', display: 'flex', justifyContent: 'flex-end' }}>
                    <img style={{ width: '150px' }} id={this.id}></img>
                    {/* <div>JHD211100001</div> */}
                </div>
            </div>
            <Table
                style={{ width: '100%' }}
                dataSource={this.props.entity.outboundDetails as any}
                columns={this.columns as any}
                pagination={false}
            />
        </div>
    }
}

class OutboundPrintModal extends React.Component<{
    ids: Array<any>,
    open: boolean,
    onCancel: () => void,
}>  {
    printDatasRef: PrintDatas | null = null;

    state = {
        outboundOrders: [] as Array<any>,
        printDatasKey: 0,
    }

    fetchOutbounds = () => {
        if (this.props.ids.length == 0) {
            message.error('请选择订单');
            return;
        }
        OutboundOrderApi.getListWithDetails({
            ids: this.props.ids
        }).then((datas: Array<any>) => {
            this.setState({ outboundOrders: datas });
            let skus: Array<string> = [];
            datas.forEach(data => {
                data.outboundDetails.forEach((detail: any) => {
                    if (!skus.some(e => e == detail.sku)) {
                        skus.push(detail.sku);
                    }
                });
            });

            ProductInfoHelper.fetchProducts(skus).then(() => {
                this.setState({ printDatasKey: this.state.printDatasKey + 1 });
                setTimeout(() => {
                    this.printDatasRef?.print();
                }, 10);
            });
        });
    }

    render(): React.ReactNode {
        return <div>
            <Button type='link' ghost icon={<PrinterOutlined />} onClick={this.fetchOutbounds}>打印出库单</Button>
            <PrintDatas
                key={this.state.printDatasKey}
                ref={r => this.printDatasRef = r}
                printDatas={this.state.outboundOrders.map(item => <PrintOutboundOrder
                    entity={item}
                />)}
            />
        </div>
    }
}

export default OutboundPrintModal;