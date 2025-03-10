import React from 'react';
import { InputNumber, Card, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, PurchaseOrderApi, QuoteApi, PurchaseOrderEntity, ProductInfoHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo, ImportExcelModal, ProductInfoModal, ProductSelect, ActionList } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';

// @ts-ignore
import templeteFile from './templete.xlsx';

type Props = {
    entity?: PurchaseOrderEntity,
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
        entity: {
            details: []
        } as PurchaseOrderEntity,
        productInfoShow: false,
        tableKey: 0,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return PurchaseOrderApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
            ProductInfoHelper.fetchProducts(e.details!.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        }).catch((ex) => {
        });
    }

    checkForm = () => {
        if (!this.state.entity.supplierId) {
            message.error('请选择供应商');
            return false;
        }

        if (this.state.entity.details!.length == 0) {
            message.error('请添加明细');
            return false;
        }

        let exitSkus: Array<{ sku: string, index: number }> = [];
        for (let n = 0; n < this.state.entity.details!.length; n++) {
            let detail = this.state.entity.details![n];
            if (!detail.sku) {
                message.error('请输入SKU');
                return false;
            }

            if (!ProductInfoHelper.skuToProducts[detail.sku]) {
                message.error(`无效的SKU: ${detail.sku} (第 ${n + 1} 行)`);
                return false;
            }

            let exitSku = exitSkus.find(e => e.sku == detail.sku);
            if (exitSku) {
                message.error(`第${exitSku.index + 1}与第${n + 1}行的SKU重复，请确保SKU在订单中是唯一的`);
                return false;
            }
            else {
                exitSkus.push({
                    sku: detail.sku,
                    index: n
                });
            }

            if (!detail.price) {
                message.error('请输入单价');
                return false;
            }

            if (!detail.quantity && !detail.giveQuantity) {
                message.error('请输入采购数量或者赠送数量');
                return false;
            }
        }

        return true;
    }

    // 从产品添加明细
    addDetailFromProduct = (details: Array<any>) => {
        let existDetails = [...this.state.entity.details!];
        details.forEach(item => {
            let detail = existDetails.find((e: any) => e.sku == item.sku);
            if (detail) {
                detail.sku = item.sku;
            }
            else {
                existDetails.push({
                    sku: item.sku,
                    quantity: item.quantity
                });
            }
        });
        this.state.entity.details = existDetails;
        ProductInfoHelper.fetchProducts(this.state.entity.details.map((e: any) => e.sku)).then(() => {
            this.setState({});
        });
        this.setState({
            productInfoShow: false
        });
    }

    // 导入明细
    async import(details: Array<any>) {
        // 检查数据
        for (let n = 0; n < details.length; n++) {
            if (!details[n].sku) {
                message.error('请输入SKU');
                return false;
            }
        }

        this.addDetailFromProduct(details);
    }

    // 请求供应商报价
    fetchSupplierQuote = async () => {
        if (!this.state.entity.supplierId) {
            message.error('请选择供应商');
            return;
        }

        let skus = this.state.entity.details!.map((item: any) => item.sku);
        if (skus.length == 0) {
            message.error('请添加订单明细');
            return;
        }

        this.setState({ loading: true });
        try {
            let datas = await QuoteApi.getSupplierQuote({
                supplierId: this.state.entity.supplierId,
                skus: skus
            });
            // 遍历订单明细
            for (let detail of this.state.entity.details!) {
                let skuPrice = datas.find(e => e.sku == detail.sku);
                if (skuPrice) {
                    detail.price = skuPrice.price;
                }
                else {
                    detail.price = undefined;
                }
            }
            this.calculateSumPrice();
        }
        catch { }
        this.setState({ loading: false });
    }

    // 计算总价
    calculateSumPrice = () => {
        let sumPrice = 0;
        for (let detail of this.state.entity.details!) {
            sumPrice = sumPrice + (detail.price || 0) * (detail.quantity || 0);
        }
        this.state.entity.price = sumPrice;
        this.setState({});
    }

    render() {
        return <Modal
            title={this.props.title}
            open={this.props.open}
            confirmLoading={this.state.loading}
            maskClosable={false}
            width={900}
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
                    <LabelEX isMust text={'订单号'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.props.entity?.id ? this.state.entity.orderNumber : '提交后生成'}
                    </LabelEX>
                    <LabelEX isMust text={'供应商'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder='供应商'
                            disabled={!!this.props.entity?.id}
                            value={this.state.entity.supplierId}
                            onChange={(val) => {
                                this.state.entity.supplierId = val;
                                this.setState({});
                            }}
                        >
                            {
                                this.props.suppliers.map(item => (<Select.Option disabled={!item.isActive} value={item.id}>{item.name}</Select.Option>))
                            }
                        </Select>
                    </LabelEX>
                    <LabelEX text={'订单总额'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder='订单总额'
                            addonAfter={<Button type='text' size='small' onClick={this.calculateSumPrice}>计算</Button>}
                            min={0}
                            max={99999999}
                            value={this.state.entity.price}
                            onChange={(val) => {
                                this.state.entity.price = val || undefined;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                </CardEX>
                <CardEX title='订单明细'>
                    <ActionList length={10}>
                        <div>
                            <span className='pl-4 pr-1'>快速添加</span>
                            <ProductSelect
                                style={{ width: 120 }}
                                onSelect={product => {
                                    if (product) {
                                        this.addDetailFromProduct([product])
                                    }
                                }}
                            />
                        </div>
                        <Button type='link' onClick={() => {
                            this.setState({
                                productInfoShow: true
                            });
                        }}>从列表添加明细</Button>
                        <ImportExcelModal
                            templateUrl={templeteFile}
                            onOk={(datas) => {
                                // 第一行是标题
                                let [title, ...arr] = datas;
                                this.import(arr);
                            }}
                        >
                            <Button type='link'>导入明细</Button>
                        </ImportExcelModal>
                        <Button type='link' loading={this.state.loading} onClick={this.fetchSupplierQuote}>应用供应商报价</Button>
                    </ActionList>
                    <Table
                        key={this.state.tableKey}
                        style={{ width: '100%' }}
                        columns={[{
                            title: <NumberOutlined />,
                            key: 'index',
                            fixed: 'left',
                            width: 40,
                            render: (val, row, index) => {
                                return index + 1;
                            }
                        }, {
                            title: 'Sku',
                            key: 'sku',
                            dataIndex: 'sku',
                        }, {
                            title: '名称',
                            key: 'name',
                            dataIndex: 'name',
                            width: 100,
                            render: (val, row) => {
                                return ProductInfoHelper.skuToProducts[row.sku!]?.name;
                            }
                        }, {
                            title: '计量单位',
                            key: 'unit',
                            dataIndex: 'unit',
                            width: 100,
                            render: (val, row) => {
                                return ProductInfoHelper.skuToProducts[row.sku!]?.unit || '--';
                            }
                        }, {
                            title: '采购数量',
                            key: 'quantity',
                            dataIndex: 'quantity',
                            width: 100,
                            render: (val, row) => {
                                return <InputNumber
                                    key={row.sku}
                                    placeholder='数量'
                                    size='small'
                                    min={0}
                                    max={99999999}
                                    defaultValue={row.quantity}
                                    onChange={val => {
                                        row.quantity = val || undefined;
                                        this.setState({});
                                    }}
                                />
                            }
                        }, {
                            title: '赠送数量',
                            key: 'giveQuantity',
                            dataIndex: 'giveQuantity',
                            width: 100,
                            render: (val, row) => {
                                return <InputNumber
                                    key={row.sku}
                                    placeholder='赠送数量'
                                    size='small'
                                    min={0}
                                    max={99999999}
                                    defaultValue={row.giveQuantity}
                                    onChange={val => {
                                        row.giveQuantity = val || undefined;
                                        this.setState({});
                                    }}
                                />
                            }
                        }, {
                            title: '单价',
                            key: 'price',
                            dataIndex: 'price',
                            width: 100,
                            render: (val, row) => {
                                return <InputNumber
                                    key={row.sku}
                                    placeholder='单价'
                                    size='small'
                                    min={0}
                                    max={99999999}
                                    value={row.price}
                                    onChange={val => {
                                        row.price = val || undefined;
                                        this.setState({});
                                    }}
                                />
                            }
                        }, {
                            title: '备注',
                            key: 'remark',
                            dataIndex: 'remark',
                            render: (val, row) => {
                                return <Input
                                    key={row.sku}
                                    placeholder='备注'
                                    size='small'
                                    maxLength={consts.MinTextLength}
                                    showCount
                                    defaultValue={row.remark}
                                    onChange={e => {
                                        row.remark = e.currentTarget.value;
                                        this.setState({});
                                    }}
                                />
                            }
                        }, {
                            title: '操作',
                            key: 'action',
                            width: 50,
                            fixed: 'right',
                            render: (val, row, index) => {
                                return <Button size='small' danger type='primary' icon={<DeleteOutlined />}
                                    onClick={() => {
                                        let details = [...this.state.entity.details!];
                                        details.splice(index, 1);
                                        this.state.entity.details = details;
                                        this.setState({});
                                    }}
                                ></Button>
                            }
                        }]}
                        dataSource={this.state.entity.details}
                        pagination={false}
                    />
                </CardEX>
                <CardEX title='扩展信息'>
                    <ExtraInfo
                        itemWidth={280}
                        extraInfo={this.state.entity.extraInfo}
                        onChange={extraInfo => {
                            this.state.entity.extraInfo = extraInfo;
                            this.setState({});
                        }}
                    />
                </CardEX>
                <CardEX title='其他'>
                    <LabelEX text={'备注'} style={{ width: '100%', alignItems: 'flex-start' }}>
                        <Input.TextArea
                            placeholder='备注'
                            style={{ width: '100%' }}
                            rows={4}
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
                <ProductInfoModal
                    open={this.state.productInfoShow}
                    onCancel={() => {
                        this.setState({
                            productInfoShow: false
                        });
                    }}
                    onOk={this.addDetailFromProduct}
                />
            </div>
        </Modal>
    }
}

export const Edit = OpenNewKey((props: Props) => {
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];
    const onSubmit = async (entity: any) => {
        await PurchaseOrderApi.update(entity);
        message.success('成功');
        props.onOk();
    }

    return <PageModal
        {...props}
        title={`编辑 - ${props.entity?.orderNumber}`}
        onSubmit={onSubmit}
        suppliers={suppliers}
    />
})

export const Add = OpenNewKey((props: Props) => {
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];
    const onSubmit = async (entity: any) => {
        await PurchaseOrderApi.create(entity);
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