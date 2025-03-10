import React from 'react';
import { Typography, Card, Cascader, Row, Col, Select, AutoComplete, InputNumber, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, OutboundOrderApi, OutboundOrderEntity, IceStateType, enums, ProductInfoHelper, ChinaAreaCodeHelper, AddressBookEntity } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput, Help, ExtraInfo, ProductInfoModal, AddressBookModal, ProductSelect, ActionList } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';

let { Title } = Typography;

const SkukHelp = () => {
    const HelpContent = <div>
        <Typography.Paragraph>如果你点击的是添加"添加明细"按钮，手动输入SKU，在SKU输入结束后记得按下"回车"键，否则库存数量将不会显示</Typography.Paragraph>
        <Typography.Paragraph type='warning'>注：如果库存数量未显示，则在SKU输入框按下"回车"键</Typography.Paragraph>
    </div>

    return <Help title='SKU输入框说明' body={HelpContent} />
}

type Props = {
    entity?: OutboundOrderEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
};

class PageModal extends React.Component<{
    title: string,
    onSubmit: (entity: any) => Promise<void>,
    warehouseId: string,
    addressBooks: Array<AddressBookEntity>
} & Props> {
    state = {
        loading: false,
        entity: {
            orderType: enums.OutboundOrderType.Customize,
            outboundDetails: [],
        } as OutboundOrderEntity,
        productInfoShow: false,
        addressBookShow: false,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return OutboundOrderApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
            ProductInfoHelper.fetchProducts(e.outboundDetails!.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
            this.fetchDetailQuery(e.outboundDetails!.map((e: any) => e.sku));
        }).catch((ex) => {
        });
    }

    checkForm = () => {
        if (!this.state.entity.recvContact) {
            message.error('请填写收件人');
            return false;
        }

        if (!this.state.entity.recvContactNumber) {
            message.error('请填写收件人电话');
            return false;
        }

        if (!this.state.entity.recvProvince) {
            message.error('请选择省市区');
            return false;
        }

        if (!this.state.entity.recvAddressDetail) {
            message.error('请填写地址明细');
            return false;
        }

        if (this.state.entity.outboundDetails!.length == 0) {
            message.error('请添加明细');
            return false;
        }

        let exitSkus: Array<{ sku: string, index: number }> = [];
        for (let n = 0; n < this.state.entity.outboundDetails!.length; n++) {
            let outboundDetail = this.state.entity.outboundDetails![n];
            if (!outboundDetail.sku) {
                message.error('请输入SKU');
                return false;
            }

            if (!ProductInfoHelper.skuToProducts[outboundDetail.sku]) {
                message.error(`无效的SKU: ${outboundDetail.sku} (第 ${n + 1} 行)`);
                return false;
            }

            let exitSku = exitSkus.find(e => e.sku == outboundDetail.sku);
            if (exitSku) {
                message.error(`第${exitSku.index + 1}与第${n + 1}行的SKU重复，请确保SKU在订单中是唯一的`);
                return false;
            }
            else {
                exitSkus.push({
                    sku: outboundDetail.sku,
                    index: n
                });
            }

            if (!outboundDetail.quantity) {
                message.error('请输入SKU数量');
                return false;
            }
        }

        return true;
    }

    // 从产品添加明细
    addDetailFromProduct = (details: Array<any>) => {
        let outboundDetails = [...this.state.entity.outboundDetails!];
        // 需要查询库存数量的Sku
        let needQuerySkuQuerys: Array<string> = [];
        details.forEach(item => {
            let oldOutboundDetail = outboundDetails.find((e: any) => e.sku == item.sku);
            if (!oldOutboundDetail) {
                outboundDetails.push({
                    sku: item.sku,
                    quantity: 0,
                    maxQuantity: undefined,
                } as any);
                needQuerySkuQuerys.push(item.sku);
            }
        });
        this.state.entity.outboundDetails = outboundDetails;
        ProductInfoHelper.fetchProducts(this.state.entity.outboundDetails.map((e: any) => e.sku)).then(() => {
            this.setState({});
        });
        this.setState({
            productInfoShow: false
        });

        this.fetchDetailQuery(needQuerySkuQuerys);
    }

    // 选择地址
    selectAddress = (addresses: Array<any>) => {
        if (addresses.length > 1) {
            message.error('只支持单选操作');
            return;
        }

        let address = addresses[0];
        this.state.entity.recvContact = address.contact;
        this.state.entity.recvContactNumber = address.contactNumber;
        this.state.entity.recvPostcode = address.postcode;
        this.state.entity.recvProvince = address.province;
        this.state.entity.recvCity = address.city;
        this.state.entity.recvTown = address.town;
        this.state.entity.recvStreet = address.street;
        this.state.entity.recvAddressDetail = address.addressDetail;
        this.setState({ addressBookShow: false });
    }

    // 查询明细的库存数量
    fetchDetailQuery(needQuerySkuQuerys: Array<string>) {
        if (needQuerySkuQuerys.length == 0) {
            return Promise.resolve();
        }

        this.setState({ loading: true });
        // 查询Sku库存数量
        return iceFetch<Array<any>>('/api/wms/location-detail/stock-inquire-for-skus', {
            method: 'GET',
            urlParams: {
                warehouseId: this.props.warehouseId,
                skus: needQuerySkuQuerys
            }
        }).then(datas => {
            let outboundDetails = [...this.state.entity.outboundDetails!];
            needQuerySkuQuerys.forEach(sku => {
                var outboundDetail = outboundDetails.find(e => e.sku == sku);
                if (outboundDetail) {
                    (outboundDetail as any).maxQuantity = datas.find((e: any) => e.sku == sku)?.quantity || 0;
                }
            });
            this.state.entity.outboundDetails = outboundDetails;
            this.setState({});
        }).then(() => {
            this.setState({ loading: false });
        });
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
                return this.props.onSubmit(this.state.entity).then(() => {
                    this.setState({ loading: false });
                });
            }}
        >
            <div>
                <CardEX title='基本信息' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX isMust text={'出库单号'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        {this.props.entity?.id ? this.state.entity.outboundNumber : '提交后生成'}
                    </LabelEX>
                    <LabelEX isMust text={'收件人'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <AutoComplete
                            className='w-full'
                            placeholder='客户名'
                            options={this.state.entity.recvContact ?
                                this.props.addressBooks.filter(e => e.name && e.name.includes(this.state.entity.recvContact!)).map(item => ({
                                    value: item.name,
                                }))
                                : this.props.addressBooks.map(item => ({
                                    value: item.name
                                }))
                            }
                            value={this.state.entity.recvContact}
                            maxLength={consts.MinTextLength}
                            onChange={(e) => {
                                this.state.entity.recvContact = e;
                                this.setState({});
                            }}
                            onSelect={(name) => {
                                let addressBook = this.props.addressBooks.find(e => e.name === name);
                                if (addressBook) {
                                    this.selectAddress([addressBook]);
                                }
                            }}
                            onBlur={() => {
                                let addressBook = this.props.addressBooks.find(e => e.name === this.state.entity.recvContact);
                                if (addressBook) {
                                    this.selectAddress([addressBook]);
                                }
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'收件电话'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Input
                            placeholder='收件电话'
                            value={this.state.entity.recvContactNumber}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.recvContactNumber = e.currentTarget.value;
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
                            value={[this.state.entity.recvProvince, this.state.entity.recvCity, this.state.entity.recvTown].filter(e => e) as Array<string>}
                            onChange={(arr) => {
                                let [province, city, town] = ChinaAreaCodeHelper.getPCAForNames(arr as Array<string>);
                                this.state.entity.recvProvince = province!;
                                this.state.entity.recvCity = city!;
                                this.state.entity.recvTown = town!;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'邮编'} style={{ width: '32%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Input
                            placeholder='邮编'
                            value={this.state.entity.recvPostcode}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.recvPostcode = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'详细地址'} style={{ width: '64%' }} tagStyle={{ width: 90, textAlign: 'right' }}>
                        <Input
                            placeholder='详细地址'
                            value={this.state.entity.recvAddressDetail}
                            maxLength={consts.MediumTextLength}
                            onChange={(e) => {
                                this.state.entity.recvAddressDetail = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <Button style={{ marginLeft: 15 }} type='primary' onClick={() => {
                        this.setState({ addressBookShow: true });
                    }}>选择地址</Button>
                </CardEX>
                <CardEX title='出库明细'>
                    <ActionList>
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
                        <Button type='link' disabled={this.state.entity.orderType != enums.OutboundOrderType.Customize}
                            onClick={() => {
                                this.setState({
                                    productInfoShow: true
                                });
                            }}
                        >从产品添加明细</Button>
                        <Button type='link' loading={this.state.loading} onClick={() => {
                            this.fetchDetailQuery(this.state.entity.outboundDetails!.map((e: any) => e.sku));
                        }}>刷新库存数量</Button>
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
                            title: <div><span>SKU</span><SkukHelp /></div>,
                            key: 'sku',
                            dataIndex: 'sku',
                        }, {
                            title: '名称',
                            key: 'name',
                            dataIndex: 'name',
                            render: (val, row) => {
                                return ProductInfoHelper.skuToProducts[row.sku!]?.name;
                            }
                        }, {
                            title: '计量单位',
                            key: 'unit',
                            dataIndex: 'unit',
                            width: 120,
                            render: (val, row) => {
                                return ProductInfoHelper.skuToProducts[row.sku!]?.unit;
                            }
                        }, {
                            title: '数量',
                            key: 'quantity',
                            dataIndex: 'quantity',
                            width: 120,
                            render: (val, row: any) => {
                                return <InputNumber
                                    key={row.sku}
                                    disabled={this.state.entity.orderType != enums.OutboundOrderType.Customize}
                                    placeholder='数量'
                                    size='small'
                                    min={0}
                                    max={row.maxQuantity || 0}
                                    defaultValue={row.quantity}
                                    onChange={val => {
                                        row.quantity = val;
                                        this.setState({});
                                    }}
                                />
                            }
                        }, {
                            title: '库存数量',
                            key: 'maxQuantity',
                            dataIndex: 'maxQuantity',
                            width: 120,
                            render: (val) => {
                                return val;
                            }
                        },
                        {
                            title: '操作',
                            key: 'action',
                            width: 50,
                            fixed: 'right',
                            render: (val, row, index) => {
                                return <Button size='small' danger type='primary' icon={<DeleteOutlined />}
                                    disabled={this.state.entity.orderType != enums.OutboundOrderType.Customize}
                                    onClick={() => {
                                        let details = [...this.state.entity.outboundDetails!];
                                        details.splice(index, 1);
                                        this.state.entity.outboundDetails = details;
                                        this.setState({});
                                    }}
                                ></Button>
                            }
                        }
                        ]}
                        dataSource={this.state.entity.outboundDetails}
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
    const warehouse = useSelector((state: IceStateType) => state.global.warehouse);
    const addressBooks = useSelector((state: IceStateType) => state.addressBook.allDatas) || [];

    const onSubmit = async (entity: OutboundOrderEntity) => {
        await OutboundOrderApi.update(entity);
        props.onOk();
    }

    return <PageModal
        {...props}
        title={`编辑 - ${props.entity?.outboundNumber}`}
        onSubmit={onSubmit}
        warehouseId={warehouse.id!}
        addressBooks={addressBooks}
    />
})

export const Add = OpenNewKey((props: Props) => {
    const warehouse = useSelector((state: IceStateType) => state.global.warehouse);
    const addressBooks = useSelector((state: IceStateType) => state.addressBook.allDatas) || [];

    const onSubmit = async (entity: OutboundOrderEntity) => {
        await OutboundOrderApi.create(entity);
        props.onOk();
    }

    return <PageModal
        {...props}
        title='添加'
        onSubmit={onSubmit}
        warehouseId={warehouse.id!}
        addressBooks={addressBooks}
    />
})