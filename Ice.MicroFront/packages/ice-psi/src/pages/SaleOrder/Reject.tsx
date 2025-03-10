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

class Page extends React.Component<Props> {
    state = {
        loading: false,
        entity: {
            recvInfo: {},
            details: []
        } as SaleOrderEntity,
        rejectReason: undefined as (string | undefined),
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
        this.setState({ loading: true });
        try {
            await SaleOrderApi.reject({
                id: this.props.entity.id!,
                rejectReason: this.state.rejectReason
            });
            this.props.onOk();
        } catch { }
        this.setState({ loading: false });
    }

    render() {
        return <Modal
            title={`驳回 - ${this.state.entity?.orderNumber}`}
            confirmLoading={this.state.loading}
            open={this.props.open}
            maskClosable={false}
            width={400}
            onCancel={this.props.onCancel}
            onOk={this.onCommit}
        >
            <div>
                <LabelEX text={'驳回原因'} style={{ width: '100%', alignItems: 'flex-start' }}>
                    <Input.TextArea
                        style={{ width: '100%' }}
                        rows={3}
                        showCount
                        maxLength={consts.MediumTextLength}
                        value={this.state.rejectReason}
                        onChange={e => {
                            this.setState({ rejectReason: e.currentTarget.value });
                        }}
                    />
                </LabelEX>
            </div>
        </Modal>
    }
}

export default OpenNewKey(Page);