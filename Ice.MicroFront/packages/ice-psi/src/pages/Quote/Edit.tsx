import React from 'react';
import { Typography, Card, InputNumber, DatePicker, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, QuoteApi, QuoteEntity, ProductInfoHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ProductInfoModal, ProductSelect } from 'ice-layout';
import { useSelector } from 'react-redux';
import dayjs, { Dayjs } from 'dayjs';

let { Title } = Typography;

type Props = {
    entity?: QuoteEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
};

class PageModal extends React.Component<{
    title: string,
    onSubmit: (entity: any) => Promise<void>,
    suppliers: Array<any>,
} & Props> {
    state = {
        loading: false,
        entity: {} as QuoteEntity,
        productInfoShow: false,
    }

    componentDidMount(): void {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return QuoteApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
            ProductInfoHelper.fetchProducts([e.sku!]).then(() => {
                this.setState({});
            });
        }).catch((ex) => {
        });
    }

    checkForm = () => {
        if (!this.state.entity.sku) {
            message.error('请输入SKU');
            return false;
        }

        if (!this.state.entity.price) {
            message.error('请输入价格');
            return false;
        }

        if (!this.state.entity.supplierId) {
            message.error('请选择供应商');
            return false;
        }

        return true;
    }

    // 从产品
    selectProduct = (details: Array<any>) => {
        if (details.length > 1) {
            message.warning('不支持多选操作');
            return;
        }
        this.state.entity.sku = details[0].sku;
        ProductInfoHelper.fetchProducts([this.state.entity.sku!]).then(() => {
            this.setState({});
        });
        this.setState({
            productInfoShow: false
        });
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
                    <LabelEX isMust text={'SKU'} style={{ width: '100%' }} tagStyle={{ width: 80, textAlign: 'end' }}>
                        <ProductSelect
                            key={this.state.entity.id}
                            style={{ width: '100%' }}
                            disabled={!!this.state.entity.id}
                            sku={this.state.entity.sku}
                            onSelect={product => {
                                if (!product) {
                                    return;
                                }
                                this.state.entity.sku = product.sku;
                                this.setState({});
                                ProductInfoHelper.fetchProducts([product.sku!]).then(() => {
                                    this.setState({});
                                });
                            }}
                        />
                    </LabelEX>
                    <LabelEX text='' style={{ width: '100%' }} tagStyle={{ width: 80, textAlign: 'end' }}>
                        <Space>
                            <span>产品名称：{ProductInfoHelper.skuToProducts[this.state.entity.sku!]?.name}</span>
                            <span>/</span>
                            <span>计量单位：{ProductInfoHelper.skuToProducts[this.state.entity.sku!]?.unit}</span>
                        </Space>
                    </LabelEX>
                    <LabelEX isMust text={'供应商'} style={{ width: '100%' }} tagStyle={{ width: 80, textAlign: 'end' }}>
                        <Select
                            placeholder='供应商'
                            disabled={!!this.props.entity?.id}
                            style={{ width: '100%' }}
                            value={this.state.entity.supplierId}
                            onChange={(val) => {
                                this.state.entity.supplierId = val;
                                this.setState({});
                            }}
                        >
                            {
                                this.props.suppliers.map(e => (<Select.Option value={e.id}>{e.name}</Select.Option>))
                            }
                        </Select>
                    </LabelEX>
                    <LabelEX isMust text={'价格'} style={{ width: '100%' }} tagStyle={{ width: 80, textAlign: 'end' }}>
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder='价格'
                            min={0}
                            max={99999999}
                            value={this.state.entity.price}
                            onChange={(val) => {
                                this.state.entity.price = val || undefined;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'过期时间'} style={{ width: '100%' }} tagStyle={{ width: 80, textAlign: 'end' }}>
                        <DatePicker
                            placeholder='过期时间'
                            style={{ width: '100%' }}
                            value={this.state.entity.expiration ? dayjs(this.state.entity.expiration) : null}
                            onChange={(val) => {
                                this.state.entity.expiration = val?.toDate().toISOString();
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
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];
    const onSubmit = async (entity: any) => {
        await QuoteApi.update(entity);
        message.success('成功');
        props.onOk();
    }

    return <PageModal
        {...props}
        title={`编辑 - ${props.entity?.sku}`}
        onSubmit={onSubmit}
        suppliers={suppliers}
    />
})

export const Add = OpenNewKey((props: Props) => {
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];
    const onSubmit = async (entity: any) => {
        await QuoteApi.create(entity);
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