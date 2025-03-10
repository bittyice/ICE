import React from 'react';
import { DatePicker, Card, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, PurchaseReturnOrderApi, PurchaseReturnOrderEntity, ProductInfoHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import {NumberOutlined} from '@ant-design/icons';

type Props = {
    entity?: PurchaseReturnOrderEntity,
    open: boolean,
    onCancel: () => void,
};

class Page extends React.Component<Props & {
    suppliers: Array<any>
}> {
    state = {
        loading: false,
        entity: {
            details: [] as Array<any>
        } as PurchaseReturnOrderEntity,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return PurchaseReturnOrderApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
            ProductInfoHelper.fetchProducts(e.details!.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        }).catch((ex) => {
        });
    }

    render() {
        return <Modal
            title={`详情 - ${this.props.entity?.orderNumber}`}
            open={this.props.open}
            maskClosable={false}
            width={800}
            onCancel={this.props.onCancel}
            footer={null}
        >
            <div>
                <CardEX title='基本信息' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX isMust text={'订单号'} style={{ width: '32%' }}>
                        {this.state.entity.orderNumber}
                    </LabelEX>
                    <LabelEX isMust text={'供应商'} style={{ width: '32%' }}>
                        {this.props.suppliers.find(e => e.id == this.state.entity.supplierId)?.name}
                    </LabelEX>
                    <LabelEX text={'订单金额'} style={{ width: '32%' }}>
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
                            title: '数量',
                            key: 'quantity',
                            dataIndex: 'quantity',
                        }, {
                            title: '金额',
                            key: 'price',
                            dataIndex: 'price',
                        }, {
                            title: '名称',
                            key: 'name',
                            dataIndex: 'name',
                            render: (val, row) => {
                                return ProductInfoHelper.skuToProducts[row.sku!]?.name;
                            }
                        }, {
                            title: '体积',
                            key: 'volume',
                            dataIndex: 'volume',
                            render: (val, row) => {
                                return `${ProductInfoHelper.skuToProducts[row.sku!]?.volume || ''}(${ProductInfoHelper.skuToProducts[row.sku!]?.volumeUnit || '--'})`;
                            }
                        }, {
                            title: '重量',
                            key: 'weight',
                            dataIndex: 'weight',
                            render: (val, row) => {
                                return `${ProductInfoHelper.skuToProducts[row.sku!]?.weight || ''}(${ProductInfoHelper.skuToProducts[row.sku!]?.weightUnit || '--'})`;
                            }
                        },]}
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