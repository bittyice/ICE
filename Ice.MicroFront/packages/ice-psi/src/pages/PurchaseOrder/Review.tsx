import React from 'react';
import { Typography, Card, Divider, Row, Col, Select, DatePicker, Tag, Table, Button, Space, Input, InputNumber, Modal, message, } from 'antd';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';
import { IceStateType, PurchaseOrderApi, PurchaseOrderEntity, ProductInfoHelper } from 'ice-core';
import { LabelEX, CardEX, ExtraInfo, OpenNewKey } from 'ice-layout';
import { useSelector, useDispatch } from 'react-redux';

type Props = {
    entity: PurchaseOrderEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
};

class Page extends React.Component<Props & {
    suppliers: Array<any>,
}> {
    state = {
        loading: false,
        entity: {
            details: []
        } as PurchaseOrderEntity,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return PurchaseOrderApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
            ProductInfoHelper.fetchProducts(e.details!.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        }).catch((ex) => {
        });
    }

    // 通过审核
    fetchToPurchasing = async () => {
        this.setState({ loading: true });
        try {
            await PurchaseOrderApi.toPurchasing(this.props.entity.id!);
            message.success('审核成功');
            this.props.onOk();
        } catch { }
        this.setState({ loading: false });
    }

    render() {
        return <Modal
            title={`审核 - ${this.props.entity?.orderNumber}`}
            confirmLoading={this.state.loading}
            open={this.props.open}
            maskClosable={false}
            width={800}
            onCancel={this.props.onCancel}
            onOk={this.fetchToPurchasing}
        >
            <div>
                <CardEX title='基本信息' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX isMust text={'订单号'} style={{ width: '32%' }}>
                        {this.state.entity.orderNumber}
                    </LabelEX>
                    <LabelEX isMust text={'供应商'} style={{ width: '32%' }}>
                        {this.props.suppliers.find(e => e.id == this.state.entity.supplierId)?.name}
                    </LabelEX>
                    <LabelEX text={'订单总额'} style={{ width: '32%' }}>
                        {this.state.entity.price}
                    </LabelEX>
                </CardEX>
                <CardEX title='订单明细'>
                    <Table
                        style={{ width: '100%' }}
                        columns={[{
                            title: <NumberOutlined />,
                            key: 'index',
                            fixed: 'left',
                            width: 40,
                            render: (val, row, index) => {
                                return index + 1;
                            }
                        }, {
                            title: 'Sku',
                            key: 'sku',
                            dataIndex: 'sku',
                        }, {
                            title: '名称',
                            key: 'name',
                            dataIndex: 'name',
                            render: (val, row) => {
                                return ProductInfoHelper.skuToProducts[row.sku!]?.name;
                            }
                        }, {
                            title: '计量单位',
                            key: 'unit',
                            dataIndex: 'unit',
                            width: 100,
                            render: (val, row) => {
                                return ProductInfoHelper.skuToProducts[row.sku!]?.unit || '--';
                            }
                        }, {
                            title: '数量',
                            key: 'quantity',
                            dataIndex: 'quantity',
                        }, {
                            title: '金额',
                            key: 'price',
                            dataIndex: 'price',
                        }, {
                            title: '备注',
                            key: 'remark',
                            dataIndex: 'remark',
                        }]}
                        dataSource={this.state.entity.details}
                        pagination={false}
                    />
                </CardEX>
                <CardEX title='扩展信息'>
                    <ExtraInfo
                        itemWidth={370}
                        show
                        extraInfo={this.state.entity.extraInfo}
                        onChange={extraInfo => {
                            this.state.entity.extraInfo = extraInfo;
                            this.setState({});
                        }}
                    />
                </CardEX>
                <CardEX title='其他'>
                    <LabelEX text={'备注'} style={{ width: '100%' }}>
                        {this.state.entity.remark}
                    </LabelEX>
                </CardEX>
            </div>
        </Modal>
    }
}


export default OpenNewKey((props: Props) => {
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];

    return <Page
        {...props}
        suppliers={suppliers}
    />
});