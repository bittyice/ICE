import React from 'react';
import { DatePicker, Card, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
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
};

class Page extends React.Component<Props> {
    state = {
        loading: false,
        entity: {
            details: []
        } as SaleOrderEntity,
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

    render() {
        return <Modal
            title={`详情 - ${this.props.entity?.orderNumber}`}
            open={this.props.open}
            maskClosable={false}
            width={1000}
            onCancel={this.props.onCancel}
            footer={null}
        >
            <div>
                <CardEX title='基本信息' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX text={'销售单号'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.orderNumber}
                    </LabelEX>
                    <LabelEX text={'下单时总价'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.placeTotalPrice} ￥
                    </LabelEX>
                    <LabelEX text={'应支付总价'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.totalPrice} ￥
                    </LabelEX>
                    <LabelEX text={'已支付总价'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.totalPricePaid} ￥
                    </LabelEX>
                    <LabelEX text={'销售员'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.seller}
                    </LabelEX>
                </CardEX>
                {/* <CardEX title='发货地址' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX text={'省/市/区'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {[shipAddress.province, shipAddress.city, shipAddress.town].filter(e => e).join(' / ')}
                    </LabelEX>
                    <LabelEX text={'详细地址'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {shipAddress.addressDetail}
                    </LabelEX>
                </CardEX> */}
                <CardEX title='收件地址' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX text={'客户名'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.recvInfo?.businessName}
                    </LabelEX>
                    <LabelEX text={'收件人'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.recvInfo?.contact}
                    </LabelEX>
                    <LabelEX text={'收件电话'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.recvInfo?.contactNumber}
                    </LabelEX>
                    <LabelEX text={'省/市/区'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {[this.state.entity.recvInfo?.province, this.state.entity.recvInfo?.city, this.state.entity.recvInfo?.town].filter(e => e).join("/")}
                    </LabelEX>
                    <LabelEX text={'邮编'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.recvInfo?.postcode}
                    </LabelEX>
                    <LabelEX text={'详细地址'} style={{ width: '64%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.recvInfo?.addressDetail}
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
                    <LabelEX text={'驳回原因'} style={{ width: '100%' }}>
                        {this.state.entity.rejectReason}
                    </LabelEX>
                </CardEX>
            </div>
        </Modal>
    }
}

export default OpenNewKey(Page);