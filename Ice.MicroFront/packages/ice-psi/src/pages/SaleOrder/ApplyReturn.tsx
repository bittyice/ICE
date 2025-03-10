import React from 'react';
import { InputNumber, Typography, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, SaleOrderApi, SaleOrderEntity, SaleReturnOrderApi, ProductInfoHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo, ImportExcelModal } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';

type Props = {
    entity?: SaleOrderEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
};

type ReturnDetailType = { sku: string, placePrice: number, quantity: number, giveQuantity: number, returnQuantity: number | null, unitPrice: number | null };

class Page extends React.Component<Props> {
    state = {
        loading: false,
        entity: {
            details: []
        } as SaleOrderEntity,
        returnInfo: {
            returnDetails: [] as Array<ReturnDetailType>,
            remark: ''
        }
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
            let returnDetails: Array<ReturnDetailType> = e.details!.map((item: any) => {
                return {
                    sku: item.sku,
                    placePrice: item.placePrice,
                    quantity: item.quantity,
                    giveQuantity: item.giveQuantity,
                    returnQuantity: 0,
                    unitPrice: item.placePrice,
                }
            });
            this.state.entity = e;
            this.state.returnInfo.remark = '';
            this.state.returnInfo.returnDetails = returnDetails;
            this.setState({});

            ProductInfoHelper.fetchProducts(e.details!.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        }).catch((ex) => {
        });
    }

    onSubmit = async () => {
        let returnList = this.state.returnInfo.returnDetails.filter((e) => e.returnQuantity && e.returnQuantity > 0).map(e => ({
            sku: e.sku,
            quantity: e.returnQuantity,
            unitPrice: e.unitPrice
        }));
        if (returnList.length == 0) {
            message.warning('请填写退货数量');
            return;
        }

        this.setState({ loading: true });
        try {
            await SaleReturnOrderApi.create({
                saleNumber: this.state.entity.orderNumber,
                businessName: this.state.entity.recvInfo?.businessName,
                remark: this.state.returnInfo.remark,
                details: returnList as Array<any>
            });
            message.success('已提交申请，请等待仓库人员审核');
            this.props.onOk();
        } catch { }
        this.setState({ loading: false });
    }

    render() {
        return <Modal
            title={`申请退货 - ${this.state.entity?.orderNumber}`}
            confirmLoading={this.state.loading}
            open={this.props.open}
            maskClosable={false}
            width={1000}
            onCancel={this.props.onCancel}
            onOk={this.onSubmit}
        >
            <div>
                <CardEX title='基本信息' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX isMust text={'销售单号'} style={{ width: '33%' }}>
                        {this.state.entity.orderNumber}
                    </LabelEX>
                    <LabelEX text={'下单时总价'} style={{ width: '33%' }}>
                        {this.state.entity.placeTotalPrice}
                    </LabelEX>
                    <LabelEX text={'实际支付价'} style={{ width: '33%' }}>
                        {this.state.entity.totalPrice}
                    </LabelEX>
                </CardEX>
                <CardEX title='明细'>
                    <Typography.Text type='warning'>请认真填写单价，该价格将被用于进销存统计</Typography.Text>
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
                                return ProductInfoHelper.skuToProducts[row.sku]?.name;
                            }
                        }, {
                            title: '下单时单价',
                            key: 'placePrice',
                            dataIndex: 'placePrice',
                            width: 100,
                        }, {
                            title: '计量单位',
                            key: 'unit',
                            dataIndex: 'unit',
                            width: 100,
                            render: (val, row) => {
                                return ProductInfoHelper.skuToProducts[row.sku]?.unit;
                            }
                        }, {
                            title: '下单数量',
                            key: 'quantity',
                            dataIndex: 'quantity',
                            width: 100,
                        }, {
                            title: '赠送数量',
                            key: 'giveQuantity',
                            dataIndex: 'giveQuantity',
                            width: 100,
                        }, {
                            title: '退货数量',
                            key: 'returnQuantity',
                            dataIndex: 'returnQuantity',
                            width: 100,
                            render: (val, row) => {
                                return <InputNumber
                                    key={row.sku}
                                    placeholder='退货数量'
                                    size='small'
                                    precision={0}
                                    min={0}
                                    max={row.quantity + row.giveQuantity}
                                    defaultValue={row.returnQuantity || undefined}
                                    onChange={val => {
                                        row.returnQuantity = val;
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
                                    defaultValue={row.unitPrice || undefined}
                                    onChange={val => {
                                        row.unitPrice = val;
                                        this.setState({});
                                    }}
                                />
                            }
                        }]}
                        dataSource={this.state.returnInfo.returnDetails}
                        pagination={false}
                    />
                </CardEX>
                <CardEX title='扩展信息'>
                    <ExtraInfo
                        itemWidth={310}
                        show
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
                            value={this.state.returnInfo.remark}
                            onChange={e => {
                                this.state.returnInfo.remark = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                </CardEX>
            </div>
        </Modal>
    }
}

export default OpenNewKey(Page);