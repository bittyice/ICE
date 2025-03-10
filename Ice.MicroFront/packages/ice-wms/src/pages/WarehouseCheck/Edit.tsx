import React, { useEffect, useState } from 'react';
import { Typography, Card, Cascader, Row, Col, Select, DatePicker, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool } from 'ice-common';
import { consts, WarehouseCheckApi, WarehouseCheckEntity, IceStateType, areaSlice } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

let { Title } = Typography;

type Props = {
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
};

class PageModal extends React.Component<{
    title: string,
    onSubmit: (entity: any) => Promise<void>,
    areas: Array<any>,
} & Props> {
    state = {
        entity: {
        } as WarehouseCheckEntity
    }

    checkForm = () => {
        if (!this.state.entity.areaId) {
            message.error('请选择盘点库区');
            return false;
        }

        return true;
    }

    render() {
        return <Modal
            title={this.props.title}
            open={this.props.open}
            maskClosable={false}
            width={400}
            onCancel={this.props.onCancel}
            onOk={() => {
                if (!this.checkForm()) {
                    return;
                }

                return this.props.onSubmit(this.state.entity);
            }}
        >
            <div>
                <CardEX title='基本信息'>
                    <LabelEX isMust text={'库区'} style={{ width: '100%' }} tagStyle={{ width: 80, textAlign: 'end' }}>
                        <Select
                            style={{ width: '100%' }}
                            value={this.state.entity.areaId}
                            onChange={(val) => {
                                this.state.entity.areaId = val;
                                this.setState({});
                            }}
                        >
                            {
                                this.props.areas.map(item => (
                                    <Select.Option value={item.id}>{item.code}</Select.Option>
                                ))
                            }
                        </Select>
                    </LabelEX>
                </CardEX>
            </div>
        </Modal>
    }
}

export const Add = OpenNewKey((props: Props) => {
    const areas = useSelector((state: IceStateType) => state.area.allDatas) || [];
    const dispatch = useDispatch();

    const fetchDatas = async () => {
        dispatch(areaSlice.asyncActions.fetchAllDatas({}) as any);
    }

    const onSubmit = async (entity: WarehouseCheckEntity) => {
        await WarehouseCheckApi.create(entity);
        props.onOk();
    }

    useEffect(() => {
        fetchDatas();
    }, []);

    return <PageModal
        {...props}
        title='添加'
        onSubmit={onSubmit}
        areas={areas}
    />
})
