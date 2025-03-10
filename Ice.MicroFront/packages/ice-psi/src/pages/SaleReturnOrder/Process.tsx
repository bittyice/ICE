import React from 'react';
import { Typography, InputNumber, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, SaleReturnOrderApi, SaleReturnOrderEntity, ProductInfoHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { NumberOutlined } from '@ant-design/icons';

type Props = {
    entity?: SaleReturnOrderEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void
};

class PageModal extends React.Component<Props> {
    notificationKey = 'PushToWarehouse';
    state = {
        loading: false,
        entity: {
            details: []
        } as SaleReturnOrderEntity,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return SaleReturnOrderApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
            ProductInfoHelper.fetchProducts(e.details!.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        }).catch((ex) => {
        });
    }

    onSubmit = async () => {
        this.setState({ loading: true });
        try {
            await SaleReturnOrderApi.processed(this.props.entity?.id!);
            message.success('处理成功');
            this.props.onOk();
        }
        catch (ex: any) {
        }
        this.setState({ loading: false });
    }

    render() {
        return <Modal
            title='处理退货'
            open={this.props.open}
            confirmLoading={this.state.loading}
            maskClosable={false}
            width={800}
            onCancel={this.props.onCancel}
            onOk={this.onSubmit}
        >
            <div>
                <CardEX title='基本信息' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX text={'退货单号'} style={{ width: '33%' }}>
                        {this.state.entity.orderNumber}
                    </LabelEX>
                    <LabelEX text={'销售单号'} style={{ width: '33%' }}>
                        {this.state.entity.saleNumber}
                    </LabelEX>
                    <LabelEX text={'客户名'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.businessName}
                    </LabelEX>
                    <LabelEX text={'退货总价'} style={{ width: '33%' }}>
                        {this.state.entity.totalPrice}
                    </LabelEX>
                </CardEX>
                <CardEX title='明细'>
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
                            width: 200,
                        }, {
                            title: '名称',
                            key: 'name',
                            dataIndex: 'name',
                            width: 100,
                            render: (val, row) => {
                                return ProductInfoHelper.skuToProducts[row.sku!]?.name;
                            }
                        }, {
                            title: '计量单位',
                            key: 'unit',
                            dataIndex: 'unit',
                            width: 100,
                            render: (val, row) => {
                                return ProductInfoHelper.skuToProducts[row.sku!]?.unit;
                            }
                        }, {
                            title: '退货数量',
                            key: 'quantity',
                            dataIndex: 'quantity',
                            width: 100,
                            render: (val, row) => {
                                return <span style={{ color: '#f5222d' }}>{val}</span>
                            }
                        }, {
                            title: '退货单价',
                            key: 'unitPrice',
                            dataIndex: 'unitPrice',
                            width: 100,
                            render: (val, row) => {
                                return <span style={{ color: '#f5222d' }}>{val}</span>
                            }
                        }]}
                        dataSource={this.state.entity.details}
                        pagination={false}
                    />
                </CardEX>
                <CardEX title='扩展信息'>
                    <ExtraInfo
                        key={this.state.entity.id}
                        itemWidth={310}
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

export default OpenNewKey(PageModal);