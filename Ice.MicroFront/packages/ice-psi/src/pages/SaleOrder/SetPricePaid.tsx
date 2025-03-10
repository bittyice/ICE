import React from 'react';
import { Typography, InputNumber, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, SaleOrderApi, SaleOrderEntity, ProductInfoHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { NumberOutlined } from '@ant-design/icons';

type Props = {
    entity: SaleOrderEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void
};

class PageModal extends React.Component<Props> {
    state = {
        loading: false,
        pricePaid: this.props.entity.totalPrice
    };

    fetchProcess = async () => {
        await SaleOrderApi.setTotalPricePaid({
            id: this.props.entity.id!,
            totalPricePaid: this.state.pricePaid || 0
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