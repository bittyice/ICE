import React from 'react';
import { Typography, InputNumber, Cascader, Row, Col, Select, DatePicker, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool } from 'ice-common';
import { consts, InventoryAlertApi, InventoryAlertEntity, IceStateType } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput, ProductInfoModal } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

let { Title } = Typography;

type Props = {
    entity?: InventoryAlertEntity,
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
        } as InventoryAlertEntity,
        productInfoShow: false,
    }

    componentDidMount(): void {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return InventoryAlertApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
        }).catch((ex) => {
        });
    }

    checkForm = () => {
        if (!this.state.entity.sku) {
            message.error('请输入SKU');
            return false;
        }

        if (this.state.entity.sku.length > 30) {
            message.error('SKU太长了，请重新编辑后提交');
            return false;
        }

        if (!this.state.entity.quantity) {
            message.error('请输入预警数量');
            return false;
        }

        return true;
    }

    selectProduct = (products: Array<any>) => {
        if (products.length > 1) {
            message.error("不支持勾选多个产品");
            return;
        }

        this.state.entity.sku = products[0]?.sku;
        this.setState({ productInfoShow: false });
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
                    <LabelEX isMust text={'SKU'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            disabled={!!this.props.entity?.id}
                            addonAfter={<Button disabled={!!this.props.entity?.id} size='small' onClick={() => this.setState({ productInfoShow: true })}>选择产品</Button>}
                            placeholder='SKU'
                            value={this.state.entity.sku}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.sku = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'预警数量'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <InputNumber
                            style={{ width: '50%' }}
                            placeholder='预警数量'
                            value={this.state.entity.quantity}
                            min={0}
                            max={999999}
                            onChange={(val) => {
                                this.state.entity.quantity = val!;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'启用/禁用'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
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
                <ProductInfoModal
                    open={this.state.productInfoShow}
                    onCancel={() => {
                        this.setState({
                            productInfoShow: false
                        });
                    }}
                    onOk={this.selectProduct}
                />
            </div>
        </Modal>
    }
}

export const Edit = OpenNewKey((props: Props) => {
    const onSubmit = async (entity: InventoryAlertEntity) => {
        await InventoryAlertApi.update(entity);
        props.onOk();
    }

    return <PageModal
        {...props}
        title={`编辑 - ${props.entity?.sku}`}
        onSubmit={onSubmit}
    />
})

export const Add = OpenNewKey((props: Props) => {
    const onSubmit = async (entity: InventoryAlertEntity) => {
        await InventoryAlertApi.create(entity);
        props.onOk();
    }

    return <PageModal
        {...props}
        title='添加'
        onSubmit={onSubmit}
    />
})