import React from 'react';
import { DatePicker, Card, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, ContractEntity, ContractApi, IceStateType } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';

type Props = {
    entity?: ContractEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
};

class PageModal extends React.Component<{
    title: string,
    onSubmit: (entity: ContractEntity) => Promise<void>,
    suppliers: Array<any>,
} & Props> {
    state = {
        loading: false,
        entity: {} as ContractEntity,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return ContractApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
        }).catch((ex) => {
        });
    }

    checkForm = () => {
        if (!this.state.entity.supplierId) {
            message.error('请选择供应商');
            return false;
        }

        if (!this.state.entity.contractNumber) {
            message.error('请输入合同编号');
            return false;
        }

        if (!this.state.entity.contractName) {
            message.error('请输入合同名称');
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
            width={420}
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
                    <LabelEX isMust text={'供应商'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'end' }}>
                        <Select
                            placeholder='供应商'
                            disabled={!!this.props.entity?.id}
                            style={{ width: '100%' }}
                            value={this.state.entity.supplierId}
                            onChange={val => {
                                this.state.entity.supplierId = val;
                                this.setState({});
                            }}
                        >
                            {
                                this.props.suppliers.map(item => (<Select.Option disabled={!item.isActive} value={item.id}>{item.name}</Select.Option>))
                            }
                        </Select>
                    </LabelEX>
                    <LabelEX isMust text={'合同编号'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'end' }}>
                        <Input
                            placeholder='合同编号'
                            value={this.state.entity.contractNumber}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.contractNumber = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'合同名称'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'end' }}>
                        <Input
                            placeholder='合同名称'
                            value={this.state.entity.contractName}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.contractName = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'生效时间'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'end' }}>
                        <DatePicker
                            placeholder='生效时间'
                            showTime
                            style={{ width: '100%' }}
                            value={this.state.entity.effectiveTime ? dayjs(this.state.entity.effectiveTime) : null}
                            onChange={(val) => {
                                this.state.entity.effectiveTime = val?.toDate().toISOString();
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'过期时间'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'end' }}>
                        <DatePicker
                            placeholder='过期时间'
                            showTime
                            style={{ width: '100%' }}
                            value={this.state.entity.expiration ? dayjs(this.state.entity.expiration) : null}
                            onChange={(val) => {
                                this.state.entity.expiration = val?.toDate().toISOString();
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text='附件' style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'end' }}>
                        <Input
                            style={{ width: '100%' }}
                            placeholder='附件'
                            value={this.state.entity.appendixUrl}
                            onChange={(e) => {
                                this.state.entity.appendixUrl = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                </CardEX>
                <CardEX title='扩展信息'>
                    <ExtraInfo
                        extraInfo={this.state.entity.extraInfo}
                        onChange={extraInfo => {
                            this.state.entity.extraInfo = extraInfo;
                            this.setState({});
                        }}
                    />
                </CardEX>
            </div>
        </Modal>
    }
}

export const Edit = OpenNewKey((props: Props) => {
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];

    const onSubmit = async (entity: any) => {
        await ContractApi.update(entity);
        message.success('成功');
        props.onOk();
    }

    return <PageModal
        {...props}
        title={`编辑 - ${props.entity?.contractName}`}
        onSubmit={onSubmit}
        suppliers={suppliers}
    />
})

export const Add = OpenNewKey((props: Props) => {
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];

    const onSubmit = async (entity: any) => {
        await ContractApi.create(entity);
        message.success('成功');
        props.onOk();
    }

    return <PageModal
        {...props}
        title='添加'
        onSubmit={onSubmit}
        suppliers={suppliers}
    />
})