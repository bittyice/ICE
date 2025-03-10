import React from 'react';
import { Typography, Card, Cascader, Row, Col, Select, DatePicker, InputNumber, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, OutboundOrderApi, OutboundOrderEntity, IceStateType, enums, ProductInfoHelper, ChinaAreaCodeHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput, Help, ExtraInfo, ProductInfoModal, AddressBookModal } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';

type Props = {
    entity?: OutboundOrderEntity,
    open: boolean,
    onCancel: () => void,   
};

class Page extends React.Component<Props & {
}> {
    state = {
        loading: false,
        entity: {
            orderType: enums.OutboundOrderType.Customize,
            outboundDetails: [],
        } as OutboundOrderEntity,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return OutboundOrderApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
            ProductInfoHelper.fetchProducts(e.outboundDetails!.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        }).catch((ex) => {
        });
    }

    render() {
        return <Modal
            title={`出库详情 - ${this.props.entity?.outboundNumber}`}
            open={this.props.open}
            confirmLoading={this.state.loading}
            maskClosable={false}
            width={900}
            onCancel={this.props.onCancel}
            footer={null}
        >
            <div>
                <CardEX title='基本信息' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX isMust text={'出库单号'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.outboundNumber}
                    </LabelEX>
                    <LabelEX isMust text={'收件人'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Input
                            placeholder='收件人'
                            disabled
                            value={this.state.entity.recvContact}
                            maxLength={consts.MinTextLength}
                            showCount
                        />
                    </LabelEX>
                    <LabelEX isMust text={'收件电话'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Input
                            placeholder='收件电话'
                            disabled
                            value={this.state.entity.recvContactNumber}
                            maxLength={consts.MinTextLength}
                            showCount
                        />
                    </LabelEX>
                    <LabelEX isMust text={'省/市/区'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {[this.state.entity.recvProvince, this.state.entity.recvCity, this.state.entity.recvTown].filter(e => e).join(' / ')}
                    </LabelEX>
                    <LabelEX text={'邮编'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Input
                            placeholder='邮编'
                            disabled
                            value={this.state.entity.recvPostcode}
                            maxLength={consts.MinTextLength}
                            showCount
                        />
                    </LabelEX>
                    <LabelEX isMust text={'详细地址'} style={{ width: '64%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Input
                            placeholder='详细地址'
                            disabled
                            value={this.state.entity.recvAddressDetail}
                            maxLength={consts.MediumTextLength}
                        />
                    </LabelEX>
                </CardEX>
                <CardEX title='出库明细'>
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
                            render: (val, row) => {
                                return ProductInfoHelper.skuToProducts[row.sku!]?.unit;
                            }
                        }, {
                            title: '数量',
                            key: 'quantity',
                            dataIndex: 'quantity',
                        }, {
                            title: '拣货数量',
                            key: 'sortedQuantity',
                            dataIndex: 'sortedQuantity',
                        }]}
                        dataSource={this.state.entity.outboundDetails}
                        pagination={false}
                    />
                </CardEX>
                <CardEX title='扩展信息'>
                    <ExtraInfo
                        itemWidth={280}
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