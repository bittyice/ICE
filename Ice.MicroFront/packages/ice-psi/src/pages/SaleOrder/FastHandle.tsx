import React from 'react';
import { Typography, InputNumber, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, SaleOrderApi, SaleOrderEntity, ProductInfoHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { NumberOutlined } from '@ant-design/icons';

class FastHandle extends React.Component<{
    entity: SaleOrderEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void
}> {
    state = {
        loading: false,
        totalPrice: this.props.entity.placeTotalPrice as (number | null),
    };

    fetchHandle = async () => {
        if (this.state.totalPrice == null || this.state.totalPrice == undefined) {
            message.error('请填写应支付总价');
            return;
        }

        this.setState({ loading: true });
        try {
            await SaleOrderApi.fastHandle({
                id: this.props.entity.id!,
                totalPrice: this.state.totalPrice
            });
            message.success('成功');
            this.props.onOk();
        } catch { }
        this.setState({ loading: false });
    }

    render(): React.ReactNode {
        return <Modal
            title='快速处理'
            open={this.props.open}
            onCancel={this.props.onCancel}
            onOk={this.fetchHandle}
            width={350}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <LabelEX isMust text={'应支付总价'} style={{ width: '100%' }} tagStyle={{ width: 90 }}>
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder='请输入应支付总价'
                        min={0}
                        max={99999999}
                        value={this.state.totalPrice}
                        onChange={val => {
                            this.state.totalPrice = val;
                            this.setState({});
                        }}
                    />
                </LabelEX>
                <Typography>
                    <Typography.Text type='warning'>
                        点击确定后，我们会将订单变更为已签收状态
                    </Typography.Text>
                </Typography>
            </div>
        </Modal>
    }
}

export default OpenNewKey(FastHandle);