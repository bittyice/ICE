import React from 'react';
import { Typography, notification, Divider, Row, Col, Select, DatePicker, Tag, Table, Button, Space, Input, InputNumber, Modal, message, Cascader } from 'antd';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';
import { PurchaseOrderApi, PurchaseOrderEntity } from 'ice-core';
import { LabelEX, OpenNewKey } from 'ice-layout';


type Props = {
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
    entity: any,
};

class PageModal extends React.Component<Props> {
    state = {
        loading: false,
        pricePaid: this.props.entity.price
    };

    fetchProcess = async () => {
        await PurchaseOrderApi.setPricePaid({
            id: this.props.entity.id,
            pricePaid: this.state.pricePaid
        });
        message.success('修改成功');
        this.props.onOk();
    }

    render() {
        return <Modal
            title={`修改已支付金额 - ${this.props.entity.orderNumber}`}
            open={this.props.open}
            confirmLoading={this.state.loading}
            maskClosable={false}
            width={350}
            onCancel={this.props.onCancel}
            onOk={() => {
                if (this.state.pricePaid == null || this.state.pricePaid == undefined) {
                    message.error('请输入已支付金额');
                    return;
                }

                this.fetchProcess();
            }}
        >
            <div>
                <LabelEX isMust text={'已支付金额'} style={{ width: '100%' }}>
                    <InputNumber
                        style={{ width: 150 }}
                        placeholder='已支付金额'
                        min={0}
                        max={99999999}
                        value={this.state.pricePaid}
                        onChange={val => {
                            this.setState({ pricePaid: val });
                        }}
                    />
                </LabelEX>
            </div>
        </Modal>
    }
}

export default OpenNewKey(PageModal)