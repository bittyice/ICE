import React, { useState } from 'react';
import { Select, Button, Input, Cascader, Table, Tag, Pagination, Divider, Modal, DatePicker, message, Typography, notification } from 'antd';
import Kuaidi100Config from '../Kuaidi100Config';
import { Tool } from 'ice-common';
import { OpenNewKey } from 'ice-layout';
import { Delivery100Api } from 'ice-core';

type Props = {
    open: boolean,
    onCancel: () => void,
    onOk: (data: { id: string, kuaidicom: string, payType: 1, expType: 1 }) => void,
}

class DeliverySelectModal extends React.Component<Props> {
    state = {
        deliverys: [] as Array<any>,
        selectDelivery: null,
        selectKey: null
    }

    componentDidMount(): void {
        Delivery100Api.getAllConfigs().then(datas => {
            let selectDelivery = datas.filter(e => e.isActive).find((e: any) => e.isDefault);
            let selectKey = selectDelivery?.id;
            this.setState({ selectDelivery, selectKey, deliverys: datas })
        })
    }

    render(): React.ReactNode {
        return <Modal
            title='选择快递服务'
            open={this.props.open}
            onCancel={this.props.onCancel}
            onOk={() => {
                if (!this.state.selectDelivery) {
                    message.error('请选择快递服务');
                    return;
                }

                this.props.onOk(this.state.selectDelivery);
            }}
        >
            <Table
                style={{ marginBottom: 10 }}
                rowSelection={{
                    selectedRowKeys: this.state.selectKey ? [this.state.selectKey] : [],
                    onChange: (keys, rows) => {
                        if (rows.length > 0) {
                            this.setState({ selectDelivery: rows[0], selectKey: rows[0].id });
                        }
                    },
                    type: 'radio'
                }}
                rowKey='id'
                columns={[{
                    title: '快递名',
                    dataIndex: 'kuaidicom',
                    key: 'kuaidicom',
                    render: (val) => {
                        return Kuaidi100Config.Kuaidi100Required.find(e => e.companyCode == val)?.companyName;
                    }
                }, {
                    title: '支付类型',
                    dataIndex: 'payType',
                    key: 'payType',
                    render: (val, row) => {
                        return <Select
                            size='small'
                            style={{ width: '100%' }}
                            value={row.payType}
                            onChange={(val) => {
                                row.payType = val;
                                this.setState({});
                            }}
                        >
                            {
                                Kuaidi100Config.Kuaidi100PayType.map(item => (
                                    <Select.Option value={item.value}>{item.label}</Select.Option>
                                ))
                            }
                        </Select>
                    }
                }, {
                    title: '业务类型',
                    dataIndex: 'expType',
                    key: 'expType',
                    render: (val, row) => {
                        let types = (Kuaidi100Config.Kuaidi100ExtType as any)[row.kuaidicom];
                        return <Select
                            size='small'
                            placeholder='默认业务'
                            style={{ width: '100%' }}
                            value={row.expType}
                            onChange={(val) => {
                                row.expType = val;
                                this.setState({});
                            }}
                        >
                            {
                                types.map((item: any) => <Select.Option value={item}>{item}</Select.Option>)
                            }
                        </Select>
                    }
                }]}
                dataSource={this.state.deliverys}
                pagination={false}
            />
        </Modal>
    }
}

export default DeliverySelectModal;