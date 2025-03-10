import React from 'react';
import { Typography, InputNumber, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch, AutoComplete } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { AddressBookEntity, consts, IceStateType, SaleReturnOrderApi, SaleReturnOrderEntity, ProductInfoHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo, ProductInfoModal, ActionList, ProductSelect } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';

let { Title } = Typography;

type Props = {
    entity?: SaleReturnOrderEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
};

class PageModal extends React.Component<{
    title: string,
    onSubmit: (entity: any) => Promise<void>,
    addressBooks: Array<AddressBookEntity>
} & Props> {
    state = {
        loading: false,
        entity: {
            details: []
        } as SaleReturnOrderEntity,
        productInfoShow: false,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return SaleReturnOrderApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
            ProductInfoHelper.fetchProducts(e.details!.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        }).catch((ex) => {
        });
    }

    checkForm = () => {
        if (!this.state.entity.businessName) {
            message.error('请填写客户名');
            return false;
        }

        if (this.state.entity.details!.length == 0) {
            message.error('请添加明细');
            return false;
        }

        let exitSkus: Array<{ sku: string, index: number }> = [];
        for (let n = 0; n < this.state.entity.details!.length; n++) {
            let detail = this.state.entity.details![n];

            let exitSku = exitSkus.find(e => e.sku == detail.sku);
            if (exitSku) {
                message.error(`第${exitSku.index + 1}与第${n + 1}行的SKU重复，请确保SKU在订单中是唯一的`);
                return false;
            }
            else {
                exitSkus.push({
                    sku: detail.sku!,
                    index: n
                });
            }

            if (!detail.unitPrice) {
                message.error('请输入单价');
                return false;
            }

            if (!detail.quantity) {
                message.error('请输入退货数量');
                return false;
            }
        }

        return true;
    }

    // 从产品添加明细
    addDetailFromProduct = (products: Array<any>) => {
        let details = [...this.state.entity.details!];
        products.forEach(item => {
            let oldDetail = details.find((e: any) => e.sku == item.sku);
            if (!oldDetail) {
                details.push({
                    sku: item.sku,
                    quantity: 0,
                    unitPrice: ProductInfoHelper.skuToProducts[item.sku!]?.price || 0,
                });
            }
        });
        this.state.entity.details = details;
        ProductInfoHelper.fetchProducts(details.map((e: any) => e.sku)).then(() => {
            this.setState({});
        });
        this.setState({
            productInfoShow: false
        });
    }

    applyProductPrice = () => {
        let details = this.state.entity.details;
        if (!details || details.length === 0) {
            return;
        }

        for (let detail of details) {
            detail.unitPrice = ProductInfoHelper.skuToProducts[detail.sku!]?.price;
        }
        this.setState({});
        message.success("已应用");
    }

    render() {
        return <Modal
            title={this.props.title}
            open={this.props.open}
            confirmLoading={this.state.loading}
            maskClosable={false}
            width={1000}
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
                    <LabelEX text={'退货单号'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.props.entity?.id ? this.state.entity.orderNumber : '提交后生成'}
                    </LabelEX>
                    <LabelEX text={'销售单号'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.state.entity.saleNumber}
                    </LabelEX>
                    <LabelEX isMust text={'客户名'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <AutoComplete
                            className='w-full'
                            placeholder='客户名'
                            options={this.state.entity.businessName ?
                                this.props.addressBooks.filter(e => e.name && e.name.includes(this.state.entity.businessName!)).map(item => ({
                                    value: item.name,
                                }))
                                : this.props.addressBooks.map(item => ({
                                    value: item.name
                                }))
                            }
                            value={this.state.entity.businessName}
                            maxLength={consts.MinTextLength}
                            onChange={(e) => {
                                this.state.entity.businessName = e;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                </CardEX>
                <CardEX title='退货明细'>
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
                        <Button type='link' onClick={this.applyProductPrice}>应用产品原本单价</Button>
                        <Typography.Text type='warning'>请认真填写单价，该价格将被用于进销存统计</Typography.Text>
                    </ActionList>
                    <Table
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
                            width: 200,
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
                            title: '退货数量',
                            key: 'quantity',
                            dataIndex: 'quantity',
                            width: 100,
                            render: (val, row) => {
                                return <InputNumber
                                    key={row.sku}
                                    placeholder='退货数量'
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
                            title: '退货单价',
                            key: 'unitPrice',
                            dataIndex: 'unitPrice',
                            width: 100,
                            render: (val, row) => {
                                return <InputNumber
                                    key={row.sku}
                                    placeholder='退货单价'
                                    size='small'
                                    precision={0}
                                    min={0}
                                    max={99999999}
                                    value={row.unitPrice || undefined}
                                    onChange={val => {
                                        row.unitPrice = val || undefined;
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
                        itemWidth={310}
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
                            style={{ width: '100%' }}
                            maxLength={consts.MediumTextLength}
                            showCount
                            rows={4}
                            placeholder='备注'
                            value={this.state.entity.remark}
                            onChange={e => {
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
    const addressBooks = useSelector((state: IceStateType) => state.addressBook.allDatas) || [];

    const onSubmit = async (entity: any) => {
        await SaleReturnOrderApi.update(entity);
        message.success('成功');
        props.onOk();
    }

    return <PageModal
        {...props}
        addressBooks={addressBooks}
        title={`编辑 - ${props.entity?.orderNumber}`}
        onSubmit={onSubmit}
    />
})

export const Add = OpenNewKey((props: Props) => {
    const addressBooks = useSelector((state: IceStateType) => state.addressBook.allDatas) || [];

    const onSubmit = async (entity: any) => {
        await SaleReturnOrderApi.create(entity);
        message.success('成功');
        props.onOk();
    }

    return <PageModal
        {...props}
        addressBooks={addressBooks}
        title='添加'
        onSubmit={onSubmit}
    />
})