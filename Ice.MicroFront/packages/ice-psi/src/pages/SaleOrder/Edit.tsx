import React from 'react';
import { InputNumber, Typography, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, AutoComplete } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, SaleOrderApi, SaleOrderEntity, ProductInfoHelper, ChinaAreaCodeHelper, AddressBookEntity } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo, ImportExcelModal, ProductInfoModal, AddressBookModal, ProductSelect, ActionList } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';

type Props = {
    entity?: SaleOrderEntity,
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
            recvInfo: {},
            details: []
        } as SaleOrderEntity,
        productInfoShow: false,
        addressBookShow: false
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return SaleOrderApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
            ProductInfoHelper.fetchProducts(e.details!.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        }).catch((ex) => {
        });
    }

    checkForm = () => {
        if (!this.state.entity.recvInfo!.businessName) {
            message.error('请填写客户名');
            return false;
        }

        if (!this.state.entity.recvInfo!.contact) {
            message.error('请填写联系人');
            return false;
        }

        if (!this.state.entity.recvInfo!.contactNumber) {
            message.error('请填写联系电话');
            return false;
        }

        if (!this.state.entity.recvInfo!.province) {
            message.error('请选择省市区');
            return false;
        }

        if (!this.state.entity.recvInfo!.addressDetail) {
            message.error('请填写详细地址');
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

            if (!detail.placePrice) {
                message.error('请输入下单时单价');
                return false;
            }

            if (!detail.quantity && !detail.giveQuantity) {
                message.error('请输入销售数量或者赠送数量');
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
                    placePrice: 0,
                    giveQuantity: 0,
                });
            }
        });
        this.state.entity.details = details;
        ProductInfoHelper.fetchProducts(details.map((e: any) => e.sku)).then(() => {
            this.state.entity.details!.forEach((item: any) => {
                if (!item.placePrice) {
                    item.placePrice = ProductInfoHelper.skuToProducts[item.sku]?.price || 0;
                }
            });
            this.setState({});
        });
        this.setState({
            productInfoShow: false
        });
    }

    // 选择地址
    selectAddress = (addresses: Array<any>) => {
        if (addresses.length > 1) {
            message.error('只支持单选操作');
            return;
        }

        let address = addresses[0];
        if (!this.state.entity.recvInfo!.businessName) {
            this.state.entity.recvInfo!.businessName = address.name;
        }
        this.state.entity.recvInfo!.contact = address.contact;
        this.state.entity.recvInfo!.contactNumber = address.contactNumber;
        this.state.entity.recvInfo!.postcode = address.postcode;
        this.state.entity.recvInfo!.province = address.province;
        this.state.entity.recvInfo!.city = address.city;
        this.state.entity.recvInfo!.town = address.town;
        this.state.entity.recvInfo!.street = address.street;
        this.state.entity.recvInfo!.addressDetail = address.addressDetail;
        this.setState({ addressBookShow: false });
    }

    fetchLateBusinessQuotes = async () => {
        if (!this.state.entity.recvInfo?.businessName) {
            message.error('请填写客户名称');
            return;
        }

        let details = this.state.entity.details;
        if (!details || details.length === 0) {
            return;
        }

        let latedetails = await SaleOrderApi.getLateBusinessQuotes({
            businessName: this.state.entity.recvInfo.businessName,
            skus: details.map(e => e.sku!)
        });

        if (latedetails.length === 0) {
            message.warning('未找到上次的报价');
            return;
        }

        for (let detail of details) {
            let latedetail = latedetails.find(e => e.sku === detail.sku);
            if (!latedetail) {
                continue;
            }
            detail.placePrice = latedetail.placePrice;
        }
        this.setState({});
        message.success("已应用");
    }

    applyProductPrice = () => {
        let details = this.state.entity.details;
        if (!details || details.length === 0) {
            return;
        }

        for (let detail of details) {
            detail.placePrice = ProductInfoHelper.skuToProducts[detail.sku!]?.price;
        }
        this.setState({});
        message.success("已应用");
    }

    render() {
        let placeTotalPrice = 0;
        this.state.entity.details!.forEach((item: any) => {
            placeTotalPrice = placeTotalPrice + (item.placePrice || 0) * item.quantity;
        });
        placeTotalPrice = parseFloat(placeTotalPrice.toFixed(2));

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
                    <LabelEX isMust text={'销售单号'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.props.entity?.id ? this.state.entity.orderNumber : '提交后生成'}
                    </LabelEX>
                    <LabelEX text={'下单时总价'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {placeTotalPrice || 0} ￥
                    </LabelEX>
                    <LabelEX text={'销售员'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Input
                            placeholder='销售员'
                            value={this.state.entity.seller}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.seller = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                </CardEX>
                <CardEX title='收件地址' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX isMust text={'客户名'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <AutoComplete
                            className='w-full'
                            placeholder='客户名'
                            options={this.state.entity.recvInfo!.businessName ?
                                this.props.addressBooks.filter(e => e.name && e.name.includes(this.state.entity.recvInfo!.businessName!)).map(item => ({
                                    value: item.name,
                                }))
                                : this.props.addressBooks.map(item => ({
                                    value: item.name
                                }))
                            }
                            value={this.state.entity.recvInfo!.businessName}
                            maxLength={consts.MinTextLength}
                            onChange={(e) => {
                                this.state.entity.recvInfo!.businessName = e;
                                this.setState({});
                            }}
                            onSelect={(name) => {
                                let addressBook = this.props.addressBooks.find(e => e.name === name);
                                if (addressBook) {
                                    this.selectAddress([addressBook]);
                                }
                            }}
                            onBlur={() => {
                                let addressBook = this.props.addressBooks.find(e => e.name === this.state.entity.recvInfo!.businessName);
                                if (addressBook) {
                                    this.selectAddress([addressBook]);
                                }
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'收件人'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Input
                            placeholder='收件人'
                            value={this.state.entity.recvInfo!.contact}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.recvInfo!.contact = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'收件电话'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Input
                            placeholder='收件电话'
                            value={this.state.entity.recvInfo!.contactNumber}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.recvInfo!.contactNumber = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'省/市/区'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Cascader
                            placeholder='省/市/区'
                            style={{ width: '100%' }}
                            options={ChinaAreaCodeHelper.areas}
                            fieldNames={{ label: 'name', value: 'name', children: 'children' }}
                            value={[this.state.entity.recvInfo!.province, this.state.entity.recvInfo!.city, this.state.entity.recvInfo!.town].filter(e => e) as Array<string>}
                            onChange={(arr) => {
                                let [province, city, town] = ChinaAreaCodeHelper.getPCAForNames(arr as Array<string>);
                                this.state.entity.recvInfo!.province = province || undefined;
                                this.state.entity.recvInfo!.city = city || undefined;
                                this.state.entity.recvInfo!.town = town || undefined;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'邮编'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Input
                            placeholder='邮编'
                            value={this.state.entity.recvInfo!.postcode}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.recvInfo!.postcode = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'详细地址'} style={{ width: '64%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Input
                            placeholder='详细地址'
                            value={this.state.entity.recvInfo!.addressDetail}
                            maxLength={consts.MediumTextLength}
                            onChange={(e) => {
                                this.state.entity.recvInfo!.addressDetail = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <Button style={{ marginLeft: 15 }} type='primary' onClick={() => {
                        this.setState({ addressBookShow: true });
                    }}>选择地址</Button>
                </CardEX>
                <CardEX title='明细'>
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
                        <Button type='link' onClick={this.fetchLateBusinessQuotes}>应用上次客户报价</Button>
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
                            title: '下单时单价',
                            key: 'placePrice',
                            dataIndex: 'placePrice',
                            width: 100,
                            render: (val, row) => {
                                return <InputNumber
                                    key={row.sku}
                                    placeholder='下单时单价'
                                    size='small'
                                    min={0}
                                    max={99999999}
                                    value={row.placePrice}
                                    onChange={val => {
                                        row.placePrice = val || undefined;
                                        this.setState({});
                                    }}
                                />;
                            }
                        }, {
                            title: '销售数量',
                            key: 'quantity',
                            dataIndex: 'quantity',
                            width: 100,
                            render: (val, row) => {
                                return <InputNumber
                                    key={row.sku}
                                    placeholder='销售数量'
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
                <AddressBookModal
                    open={this.state.addressBookShow}
                    onCancel={() => {
                        this.setState({
                            addressBookShow: false
                        });
                    }}
                    onOk={this.selectAddress}
                />
            </div>
        </Modal>
    }
}

export const Edit = OpenNewKey((props: Props) => {
    const addressBooks = useSelector((state: IceStateType) => state.addressBook.allDatas) || [];

    const onSubmit = async (entity: any) => {
        await SaleOrderApi.update(entity);
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
        await SaleOrderApi.create(entity);
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