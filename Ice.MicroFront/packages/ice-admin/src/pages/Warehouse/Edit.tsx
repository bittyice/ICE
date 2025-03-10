import React from 'react';
import { Typography, Card, Cascader, Row, Col, Select, DatePicker, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool } from 'ice-common';
import { consts, WarehouseEntity, WarehouseApi, ChinaAreaCodeHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey } from 'ice-layout';

let { Title } = Typography;

type Props = {
    entity?: WarehouseEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
};

class PageModal extends React.Component<{
    title: string,
    onSubmit: (entity: WarehouseEntity) => Promise<void>,
} & Props> {
    state = {
        loading: false,
        entity: {
            isActive: true
        } as WarehouseEntity,
    }

    componentDidMount(): void {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return WarehouseApi.get(this.props.entity.id).then((e) => {
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
            message.error('请输入仓库名');
            return false;
        }

        if (!this.state.entity.principal) {
            message.error('请输入仓负责人');
            return false;
        }

        if (!this.state.entity.contactNumber) {
            message.error('请填写联系电话');
            return false;
        }

        if (!this.state.entity.province) {
            message.error('请选择省市区');
            return false;
        }

        if (!this.state.entity.addressDetail) {
            message.error('请填写地址明细');
            return false;
        }

        return true;
    }

    render() {
        return <Modal
            title={this.props.title}
            confirmLoading={this.state.loading}
            open={this.props.open}
            maskClosable={false}
            width={450}
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
                <CardEX title='基本信息'>
                    <LabelEX isMust text={'编码'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'end' }}>
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
                    <LabelEX isMust text={'仓库名'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'end' }}>
                        <Input
                            placeholder='仓库名'
                            value={this.state.entity.name}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.name = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'负责人'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'end' }}>
                        <Input
                            placeholder='负责人'
                            value={this.state.entity.principal}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.principal = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'联系电话'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'end' }}>
                        <Input
                            placeholder='联系电话'
                            value={this.state.entity.contactNumber}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.contactNumber = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'省/市/区'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Cascader
                            placeholder='省/市/区'
                            style={{ width: '100%' }}
                            options={ChinaAreaCodeHelper.areas}
                            fieldNames={{ label: 'name', value: 'name', children: 'children' }}
                            value={[this.state.entity.province, this.state.entity.city, this.state.entity.town].filter(e => e) as Array<string>}
                            onChange={(arr) => {
                                let [province, city, town] = ChinaAreaCodeHelper.getPCAForNames(arr as Array<string>);
                                this.state.entity.province = province!;
                                this.state.entity.city = city!;
                                this.state.entity.town = town!;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'邮编'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Input
                            placeholder='邮编'
                            value={this.state.entity.postcode}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.postcode = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'详细地址'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Input
                            placeholder='详细地址'
                            value={this.state.entity.addressDetail}
                            maxLength={consts.MediumTextLength}
                            onChange={(e) => {
                                this.state.entity.addressDetail = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'启用/禁用'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'end' }}>
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
                    <LabelEX text={'入库批次'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'end' }}>
                        <Switch
                            checkedChildren='启用'
                            unCheckedChildren='不启用'
                            checked={this.state.entity.enableInboundBatch}
                            onChange={(e) => {
                                this.state.entity.enableInboundBatch = e;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'备注'} style={{ width: '100%', alignItems: 'flex-start' }} tagStyle={{ width: 90, textAlign: 'end' }}>
                        <Input.TextArea
                            style={{ width: '100%' }}
                            placeholder='备注'
                            value={this.state.entity.remark}
                            maxLength={consts.MediumTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.remark = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                </CardEX>
            </div>
        </Modal>
    }
}

export const Edit = OpenNewKey(class extends React.Component<Props> {
    onSubmit = async (entity: WarehouseEntity) => {
        await WarehouseApi.update(entity);
        this.props.onOk();
    }

    render() {
        return <PageModal
            {...this.props}
            title={`编辑 - ${this.props.entity?.name}`}
            onSubmit={this.onSubmit}
        />
    }
})

export const Add = OpenNewKey(class extends React.Component<Props> {
    onSubmit = async (entity: WarehouseEntity) => {
        await WarehouseApi.create(entity);
        this.props.onOk();
    }

    render() {
        return <PageModal
            {...this.props}
            title='添加'
            onSubmit={this.onSubmit}
        />
    }
})