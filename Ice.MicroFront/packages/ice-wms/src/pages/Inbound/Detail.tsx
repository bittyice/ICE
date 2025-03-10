import React from 'react';
import { Typography, Card, Cascader, Row, Col, Select, DatePicker, InputNumber, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool } from 'ice-common';
import { consts, InboundOrderApi, InboundOrderEntity, WarehouseEntity, IceStateType, ProductInfoHelper, LabelValues, enums } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput, Help, ExtraInfo, ProductInfoModal } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

type Props = {
    entity?: InboundOrderEntity,
    open: boolean,
    onCancel: () => void,
};

class Page extends React.Component<Props> {
    state = {
        loading: false,
        entity: {
            type: enums.InboundOrderType.Customize,
            inboundDetails: []
        } as InboundOrderEntity,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return InboundOrderApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
            ProductInfoHelper.fetchProducts(e.inboundDetails!.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        }).catch((ex) => {
        });
    }

    render() {
        return <Modal
            title={`详情 - ${this.props.entity?.inboundNumber}`}
            open={this.props.open}
            maskClosable={false}
            width={1000}
            onCancel={this.props.onCancel}
            footer={null}
        >
            <div>
                <CardEX title='基本信息' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX isMust text={'入库单号'} style={{ width: '32%' }}>
                        {this.state.entity.inboundNumber}
                    </LabelEX>
                    <LabelEX text={'入库批次号'} style={{ width: '32%' }}>
                        {this.state.entity.inboundBatch}
                    </LabelEX>
                    <LabelEX isMust text={'入库类型'} style={{ width: '32%' }}>
                        {LabelValues.InboundOrderType.find(e => e.value == this.state.entity.type)?.label}
                    </LabelEX>
                </CardEX>
                <CardEX title='入库明细'>
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
                            title: '预报数量',
                            key: 'forecastQuantity',
                            dataIndex: 'forecastQuantity',
                            width: 100,
                        }, {
                            title: '实际数量',
                            key: 'actualQuantity',
                            dataIndex: 'actualQuantity',
                            width: 100,
                            render: (val) => {
                                return <span style={{ color: '#52c41a' }}>{val}</span>
                            }
                        }, {
                            title: '上架数量',
                            key: 'shelvesQuantity',
                            dataIndex: 'shelvesQuantity',
                            width: 100,
                            render: (val) => {
                                return <span style={{ color: '#eb2f96' }}>{val}</span>
                            }
                        }, {
                            title: '保质期',
                            key: 'shelfLise',
                            dataIndex: 'shelfLise',
                            width: 100,
                            render: (val, row) => {
                                return Tool.dateFormat(val, 'yyyy-MM-dd');
                            }
                        }, {
                            title: '备注',
                            key: 'remark',
                            dataIndex: 'remark',
                            width: 150,
                        }]}
                        dataSource={this.state.entity.inboundDetails}
                        pagination={false}
                    />
                </CardEX>
                <CardEX title='扩展信息'>
                    <ExtraInfo 
                        itemWidth={225}
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