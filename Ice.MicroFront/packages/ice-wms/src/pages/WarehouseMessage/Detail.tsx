import React from 'react';
import { Typography, Card, Cascader, Row, Col, Select, DatePicker, InputNumber, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool } from 'ice-common';
import { consts, WarehouseMessageApi, WarehouseMessageEntity, IceStateType, ProductInfoHelper, LabelValues, enums } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput, Help, ExtraInfo, ProductInfoModal } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

type Props = {
    entity?: WarehouseMessageEntity,
    open: boolean,
    onCancel: () => void,
};

class Page extends React.Component<Props> {
    state = {
        loading: false,
        entity: {} as WarehouseMessageEntity,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return WarehouseMessageApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
        }).catch((ex) => {
        });
    }

    render() {
        return <Modal
            title={`消息详情`}
            open={this.props.open}
            confirmLoading={this.state.loading}
            maskClosable={false}
            width={400}
            onCancel={this.props.onCancel}
            footer={null}
        >
            <Typography>
                <Typography.Title level={5}>{this.state.entity.title}</Typography.Title>
                <Typography.Text>{this.state.entity.message}</Typography.Text>
            </Typography>
        </Modal>
    }
}

export default OpenNewKey(Page);