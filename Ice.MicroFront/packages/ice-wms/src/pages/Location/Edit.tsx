import React from 'react';
import { Typography, Card, Cascader, Row, Col, Select, DatePicker, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool } from 'ice-common';
import { consts, LocationApi, LocationEntity, AreaEntity, IceStateType } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';

let { Title } = Typography;

type Props = {
    entity?: LocationEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
};

class PageModal extends React.Component<{
    title: string,
    onSubmit: (entity: any) => Promise<void>,
    areas: Array<AreaEntity>
} & Props> {
    state = {
        loading: false,
        entity: {
            isActive: true
        } as LocationEntity,
    }

    componentDidMount() {
        if (this.props.areas.length > 0) {
            this.state.entity.areaId = this.props.areas[0].id;
            this.setState({});
        }
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return LocationApi.get(this.props.entity.id).then((e) => {
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
            confirmLoading={this.state.loading}
            title={this.props.title}
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
                    <LabelEX isMust text={'库区'} style={{ width: '100%' }} tagStyle={{ width: 80, textAlign: 'end' }}>
                        <Select
                            placeholder='请选择库区'
                            style={{ width: '100%' }}
                            value={this.state.entity.areaId}
                            onChange={(val) => {
                                this.state.entity.areaId = val;
                                this.setState({});
                            }}
                        >
                            {this.props.areas.map(item => (<Select.Option value={item.id}>{item.code}</Select.Option>))}
                        </Select>
                    </LabelEX>
                    <LabelEX isMust text={'编码'} style={{ width: '100%' }} tagStyle={{ width: 80, textAlign: 'end' }}>
                        <Input
                            placeholder='实例: A-001'
                            value={this.state.entity.code}
                            maxLength={10}
                            showCount
                            onChange={(e) => {
                                this.state.entity.code = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                </CardEX>
                <Typography.Text type='secondary'>我们期望你以库区编码作为库位编码的前缀，这样你可以享受到更多的功能。</Typography.Text>
                <Typography.Text type='secondary'>如：库区编码为 A ，则库位编码为 A-001 或者 A001。</Typography.Text>
            </div>
        </Modal>
    }
}

export const Add = OpenNewKey((props: Props) => {
    const allDatas = useSelector((state: IceStateType) => state.area.allDatas) || [];

    const onSubmit = async (entity: AreaEntity) => {
        await LocationApi.create(entity);
        props.onOk();
    }

    return <PageModal
        {...props}
        title='添加'
        onSubmit={onSubmit}
        areas={allDatas}
    />
})