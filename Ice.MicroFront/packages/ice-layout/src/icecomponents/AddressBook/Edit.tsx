import React from 'react';
import { Typography, Card, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, AddressBookApi, AddressBookEntity, ChinaAreaCodeHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey } from 'ice-layout';

let { Title } = Typography;

type Props = {
    entity?: AddressBookEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
};

class PageModal extends React.Component<{
    title: string,
    onSubmit: (entity: AddressBookEntity) => Promise<void>
} & Props> {
    state = {
        loading: false,
        entity: {} as AddressBookEntity,
    }

    componentDidMount(): void {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return AddressBookApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
        }).catch((ex) => {
        });
    }

    checkForm = () => {
        if (!this.state.entity.name) {
            message.error('请输入地址名称');
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
                    <LabelEX isMust text={'地址名称'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='地址名称'
                            value={this.state.entity.name}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.name = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'联系人'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
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
                            showCount
                            onChange={(e) => {
                                this.state.entity.contactNumber = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'省/市/区'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'right' }}>
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
                    <LabelEX text={'邮编'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'right' }}>
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
                    <LabelEX text={'详细地址'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'right' }}>
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
                </CardEX>
            </div>
        </Modal>
    }
}

export const Edit = OpenNewKey(class extends React.Component<Props> {
    onSubmit = async (entity: AddressBookEntity) => {
        await AddressBookApi.update(entity);
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
    onSubmit = async (entity: AddressBookEntity) => {
        await AddressBookApi.create(entity);
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