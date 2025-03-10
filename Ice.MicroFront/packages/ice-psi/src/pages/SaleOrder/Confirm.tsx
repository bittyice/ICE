import React from 'react';
import { Typography, InputNumber, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, SaleOrderApi, SaleOrderEntity, ProductInfoHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { NumberOutlined } from '@ant-design/icons';

type Props = {
    entity?: SaleOrderEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void
};

class Page extends React.Component<Props> {
    state = {
        loading: false,
        entity: {
            recvInfo: {},
            details: []
        } as SaleOrderEntity,
        totalPrice: null as (number | null),
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return SaleOrderApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
            ProductInfoHelper.fetchProducts(e.details!.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        }).catch((ex) => {
        });
    }

    onCommit = async () => {
        if (this.state.totalPrice == null || this.state.totalPrice == undefined) {
            message.error('请输入应支付总价');
            return;
        }

        // 检查产品是否存在
        for (let detail of this.state.entity.details!) {
            if (!ProductInfoHelper.skuToProducts[detail.sku!]) {
                message.error(`产品：${detail.sku} 不存在，无法进行确过，请联系店铺重新修改订单`);
                return;
            }
        }

        this.setState({ loading: true });
        try {
            await SaleOrderApi.confirm({
                id: this.props.entity?.id!,
                totalPrice: this.state.totalPrice
            });
            this.props.onOk();
        }
        catch { }
        this.setState({ loading: false });
    }

    render() {
        return <Modal
            title={`确认 - ${this.state.entity?.orderNumber}`}
            confirmLoading={this.state.loading}
            open={this.props.open}
            maskClosable={false}
            width={1000}
            onCancel={this.props.onCancel}
            onOk={this.onCommit}
        >
            <div>
                <CardEX title='基本信息' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX text={'销售单号'} style={{ width: '33%' }}>
                        {this.state.entity.orderNumber}
                    </LabelEX>
                    <LabelEX text={'下单时总价'} style={{ width: '33%' }}>
                        {this.state.entity.placeTotalPrice} ￥
                    </LabelEX>
                    <LabelEX isMust text={'应支付总价'} style={{ width: '33%' }}>
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder='请输入应支付总价'
                            min={0}
                            max={99999999}
                            addonAfter={<Button size='small' type='text' onClick={() => {
                                this.setState({ totalPrice: this.state.entity.placeTotalPrice });
                            }}>填入下单时总价</Button>}
                            value={this.state.totalPrice}
                            onChange={val => {
                                this.state.totalPrice = val;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                </CardEX>
                <CardEX title='收件地址' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX isMust text={'客户名'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.recvInfo?.businessName}
                    </LabelEX>
                    <LabelEX isMust text={'收件人'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.recvInfo?.contact}
                    </LabelEX>
                    <LabelEX isMust text={'收件电话'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.recvInfo?.contactNumber}
                    </LabelEX>
                    <LabelEX isMust text={'省/市/区'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {[this.state.entity.recvInfo?.province, this.state.entity.recvInfo?.city, this.state.entity.recvInfo?.town].filter(e => e).join("/")}
                    </LabelEX>
                    <LabelEX text={'邮编'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.recvInfo?.postcode}
                    </LabelEX>
                    <LabelEX isMust text={'详细地址'} style={{ width: '64%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.recvInfo?.addressDetail}
                    </LabelEX>
                </CardEX>
                <CardEX title='明细'>
                    <Typography.Text type='warning'>如果门店下单时的单价和当前单价不一致，最好的做法是驳回订单让门店重新申请</Typography.Text>
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
                            title: '下单时单价',
                            key: 'placePrice',
                            dataIndex: 'placePrice',
                            width: 100,
                            render: (val) => {
                                return `${val} ￥`
                            }
                        },
                        {
                            title: '计量单位',
                            key: 'unit',
                            dataIndex: 'unit',
                            width: 100,
                            render: (val, row) => {
                                return ProductInfoHelper.skuToProducts[row.sku!]?.unit;
                            }
                        }, {
                            title: '销售数量',
                            key: 'quantity',
                            dataIndex: 'quantity',
                            width: 100,
                        }, {
                            title: '赠送数量',
                            key: 'giveQuantity',
                            dataIndex: 'giveQuantity',
                            width: 100,
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

export default OpenNewKey(Page);