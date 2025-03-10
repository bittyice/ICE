import React from 'react';
import { DatePicker, Card, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, QaTagApi, QaTagEntity } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';

type Props = {
    entity?: QaTagEntity,
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
        } as QaTagEntity,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return QaTagApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
        }).catch((ex) => {
        });
    }

    checkForm = () => {
        if (!this.state.entity.name) {
            message.error('请输入名称');
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
                    <LabelEX isMust text={'名称'} style={{ width: '100%' }}>
                        <Input
                            placeholder='名称'
                            value={this.state.entity.name}
                            maxLength={30}
                            showCount
                            onChange={(e) => {
                                this.state.entity.name = e.currentTarget.value;
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
    const onSubmit = async (entity: any) => {
        await QaTagApi.update(entity);
        message.success('成功');
        props.onOk();
    }

    return <PageModal
        {...props}
        title={`编辑`}
        onSubmit={onSubmit}
    />
})

export const Add = OpenNewKey((props: Props) => {
    const onSubmit = async (entity: any) => {
        await QaTagApi.create(entity);
        message.success('成功');
        props.onOk();
    }

    return <PageModal
        {...props}
        title='添加'
        onSubmit={onSubmit}
    />
})