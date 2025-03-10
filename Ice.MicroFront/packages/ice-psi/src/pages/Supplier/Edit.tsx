import React from 'react';
import { DatePicker, Card, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, SupplierApi, SupplierEntity } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';

type Props = {
    entity?: SupplierEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
};

class PageModal extends React.Component<{
    title: string,
    onSubmit: (entity: any) => Promise<void>,
} & Props> {
    state = {
        loading: false,
        entity: {
            isActive: true,
        } as SupplierEntity,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return SupplierApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
        }).catch((ex) => {
        });
    }

    checkForm = () => {
        if (!this.state.entity.code) {
            message.error('请输入编码');
            return false;
        }

        if (!this.state.entity.name) {
            message.error('请输入名称');
            return false;
        }

        if (!this.state.entity.contact) {
            message.error('请输入联系人');
            return false;
        }

        return true;
    }

    render() {
        return <Modal
            title={this.props.title}
            open={this.props.open}
            confirmLoading={this.state.loading}
            maskClosable={false}
            width={400}
            onCancel={this.props.onCancel}
            onOk={() => {
                if (!this.checkForm()) {
                    return;
                }

                this.setState({ loading: true });
                return this.props.onSubmit(this.state.entity).finally(() => {
                    this.setState({ loading: false });
                });
            }}
        >
            <div>
                <CardEX title='基本信息' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX isMust text={'编码'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='编码'
                            disabled={!!this.props.entity?.id}
                            value={this.state.entity.code}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.code = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'名称'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='名称'
                            value={this.state.entity.name}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.name = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'联系人'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='联系人'
                            value={this.state.entity.contact}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.contact = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'联系电话'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='联系电话'
                            value={this.state.entity.contactNumber}
                            maxLength={consts.MinTextLength}
                            onChange={(e) => {
                                this.state.entity.contactNumber = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'邮箱'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='邮箱'
                            value={this.state.entity.email}
                            maxLength={consts.MinTextLength}
                            onChange={(e) => {
                                this.state.entity.email = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'启用/禁用'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Switch
                            checkedChildren='启用'
                            unCheckedChildren='禁用'
                            checked={this.state.entity.isActive}
                            onChange={(e) => {
                                this.state.entity.isActive = e;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <CardEX title='扩展信息' style={{ width: '100%' }}>
                        <ExtraInfo
                            itemWidth='100%'
                            extraInfo={this.state.entity.extraInfo}
                            onChange={extraInfo => {
                                this.state.entity.extraInfo = extraInfo;
                                this.setState({});
                            }}
                        />
                    </CardEX>
                </CardEX>
            </div>
        </Modal>
    }
}

export const Edit = OpenNewKey((props: Props) => {
    const onSubmit = async (entity: any) => {
        await SupplierApi.update(entity);
        message.success('成功');
        props.onOk();
    }

    return <PageModal
        {...props}
        title={`编辑 - ${props.entity?.code}`}
        onSubmit={onSubmit}
    />
})

export const Add = OpenNewKey((props: Props) => {
    const onSubmit = async (entity: any) => {
        await SupplierApi.create(entity);
        message.success('成功');
        props.onOk();
    }

    return <PageModal
        {...props}
        title='添加'
        onSubmit={onSubmit}
    />
})