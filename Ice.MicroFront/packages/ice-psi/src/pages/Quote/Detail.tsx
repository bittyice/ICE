import React from 'react';
import { Typography, Card, InputNumber, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, QuoteApi, QuoteEntity, ProductInfoHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey } from 'ice-layout';
import { useSelector } from 'react-redux';

type Props = {
    entity?: QuoteEntity,
    open: boolean,
    onCancel: () => void, 
};

class Page extends React.Component<Props & {
    suppliers: Array<any>,
}> {
    state = {
        loading: false,
        entity: {} as QuoteEntity,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return QuoteApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
        }).catch((ex) => {
        });
    }

    render() {
        return <Modal
            title={`详情 - ${this.props.entity?.sku}`}
            open={this.props.open}
            maskClosable={false}
            width={400}
            onCancel={this.props.onCancel}
            footer={null}
        >
            <div>
                <CardEX title='基本信息' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX isMust text={'SKU'} style={{ width: '100%' }} tagStyle={{ width: 80, textAlign: 'end' }}>
                        <Input
                            placeholder='SKU'
                            disabled
                            value={this.state.entity.sku}
                            maxLength={consts.MinTextLength}
                        />
                    </LabelEX>
                    <LabelEX text='' style={{ width: '100%' }} tagStyle={{ width: 80, textAlign: 'end' }}>
                        <Space>
                            <span>产品名称：{ProductInfoHelper.skuToProducts[this.state.entity.sku!]?.name}</span>
                            <span>/</span>
                            <span>计量单位：{ProductInfoHelper.skuToProducts[this.state.entity.sku!]?.unit}</span>
                        </Space>
                    </LabelEX>
                    <LabelEX isMust text={'价格'} style={{ width: '100%' }} tagStyle={{ width: 80, textAlign: 'end' }}>
                        <InputNumber
                            style={{ width: '100%' }}
                            disabled
                            placeholder='价格'
                            value={this.state.entity.price}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'供应商'} style={{ width: '100%' }} tagStyle={{ width: 80, textAlign: 'end' }}>
                        <Select
                            placeholder='供应商'
                            style={{ width: '100%' }}
                            disabled
                            value={this.state.entity.supplierId}
                        >
                            {
                                this.props.suppliers.map(e => (<Select.Option value={e.id}>{e.name}</Select.Option>))
                            }
                        </Select>
                    </LabelEX>
                    <LabelEX text={'过期时间'} style={{ width: '100%' }} tagStyle={{ width: 80, textAlign: 'end' }}>
                        {Tool.dateFormat(this.state.entity.expiration || null)}
                    </LabelEX>
                </CardEX>
            </div>
        </Modal>
    }
}

export default (props: Props) => {
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];

    return <Page
        {...props}
        suppliers={suppliers}
    />
};