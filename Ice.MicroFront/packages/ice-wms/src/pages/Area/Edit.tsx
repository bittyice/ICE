import React from 'react';
import { Typography, Card, Cascader, Row, Col, Select, DatePicker, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool } from 'ice-common';
import { consts, AreaApi, AreaEntity, IceStateType } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

let { Title } = Typography;

type Props = {
    entity?: AreaEntity,
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
            isActive: true
        } as AreaEntity,
    }
    componentDidMount(): void {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return AreaApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
        }).catch((ex) => {
        });
    }

    checkForm = () => {
        if (!this.state.entity.code) {
            message.error('请输入编码');
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
                return this.props.onSubmit(this.state.entity).then(() => {
                    this.setState({ loading: false });
                });
            }}
        >
            <div>
                <CardEX title='基本信息'>
                    <LabelEX isMust text={'编码'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='编码'
                            disabled={!!this.props.entity?.id}
                            value={this.state.entity.code}
                            maxLength={5}
                            showCount
                            onChange={(e) => {
                                this.state.entity.code = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'允许规格'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <ArrayInput
                            value={this.state.entity.allowSpecifications ? this.state.entity.allowSpecifications.split(' ') : []}
                            onChange={(arr) => {
                                this.state.entity.allowSpecifications = arr.join(' ');
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'禁止规格'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <ArrayInput
                            value={this.state.entity.forbidSpecifications ? this.state.entity.forbidSpecifications.split(' ') : []}
                            onChange={(arr) => {
                                this.state.entity.forbidSpecifications = arr.join(' ');
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
                </CardEX>
            </div>
        </Modal>
    }
}

export const Edit = OpenNewKey((props: Props) => {
    const onSubmit = async (entity: AreaEntity) => {
        await AreaApi.update(entity);
        props.onOk();
    }

    return <PageModal
        {...props}
        title={`编辑 - ${props.entity?.code}`}
        onSubmit={onSubmit}
    />
})

export const Add = OpenNewKey((props: Props) => {
    const onSubmit = async (entity: AreaEntity) => {
        await AreaApi.create(entity);
        props.onOk();
    }

    return <PageModal
        {...props}
        title='添加'
        onSubmit={onSubmit}
    />
})