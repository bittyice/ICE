import React, { useEffect, useState } from 'react';
import { Typography, Card, Cascader, Row, Col, InputNumber, DatePicker, Tag, Table, Button, Space, Input, Modal, message, Switch, Descriptions } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, WarehouseCheckApi, WarehouseCheckEntity, IceStateType, areaSlice, ProductInfoHelper, LocationDetailApi } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { NumberOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import LocationInput from '../../components/LocationInput';
import SkuInput from '../../components/SkuInput';

let { Title } = Typography;

type Props = {
    warehouseId: string
};

class Page extends React.Component<Props> {
    input1Ref: any;
    input2Ref: any;
    input3Ref: any;

    state = {
        id: Tool.getUrlVariable(window.location.search, 'id'),
        loading: false,
        // 历史记录
        historyDatas: [],
        // 保存查询的库存数据
        inquire: null as any,
        // 盘点数据
        check: {
            sku: '',
            quantity: null as (number | null),
            locationCode: '',
            shelfLise: null as (dayjs.Dayjs | null),
            inboundBatch: ''
        },
        productInfo: {} as any
    }

    componentDidMount() {
        this.input1Ref?.focus();
    }

    // 盘点
    fetchCheck = async () => {
        if (!this.state.check.sku) {
            message.error('请输入SKU');
            return false;
        }

        if (this.state.check.quantity != 0 && !this.state.check.quantity) {
            message.error('请输入盘点数量');
            return false;
        }

        if (!this.state.check.locationCode) {
            message.error('请输入盘点库位');
            return false;
        }

        // 这里做一个判断，如果未发生更改则不调用后端接口
        if (
            this.state.check.sku == this.state.inquire?.sku &&
            this.state.check.quantity == this.state.inquire?.quantity &&
            this.state.check.locationCode == this.state.inquire?.locationCode &&
            this.state.check.shelfLise == this.state.inquire?.shelfLise &&
            this.state.check.inboundBatch == this.state.inquire?.inboundBatch
        ) {
            this.checkSuccess();
            return;
        }

        let shelfLise;
        if (this.state.check.shelfLise) {
            shelfLise = Tool.dateFormat(this.state.check.shelfLise.toDate(), 'yyyy-MM-ddT00:00:00.000Z');
        }

        await ProductInfoHelper.fetchProducts([this.state.check.sku]);

        this.setState({ loading: true });
        return WarehouseCheckApi.check({
            warehouseId: this.props.warehouseId,
            sku: this.state.check.sku,
            quantity: this.state.check.quantity,
            locationCode: this.state.check.locationCode,
            shelfLise: shelfLise,
            inboundBatch: this.state.check.inboundBatch,
            warehouseCheckId: this.state.id!,
        }).then(() => {
            this.checkSuccess();
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    // 盘点成功操作
    checkSuccess() {
        message.success(`SKU: ${this.state.check.sku}盘点成功`);
        this.setState({
            historyDatas: [
                ...this.state.historyDatas,
                {
                    ...this.state.check,
                    shelfLise: this.state.check.shelfLise ? Tool.dateFormat(this.state.check.shelfLise.toDate(), 'yyyy-MM-dd') : null
                }
            ],
            // 上架数据
            check: {
                sku: '',
                quantity: undefined,
                locationCode: '',
                shelfLise: null,
                inboundBatch: ''
            }
        });
        this.input1Ref?.focus();
    }

    // 请求库存信息
    fetchLocationSku() {
        if (!this.state.check.locationCode) {
            return;
        }

        let check = {
            sku: this.state.check.sku,
            locationCode: this.state.check.locationCode,
            quantity: 0,
            shelfLise: null,
            inboundBatch: null,
        };
        this.setState({
            // 上架数据
            check: check
        });
        this.setState({ loading: true });
        return LocationDetailApi.getLocationDetailForSku({
            locationCode: this.state.check.locationCode,
            sku: this.state.check.sku,
            warehouseId: this.props.warehouseId,
        }).then((val) => {
            let check = {
                sku: this.state.check.sku,
                locationCode: this.state.check.locationCode,
                quantity: val.quantity,
                shelfLise: val.shelfLise ? dayjs(new Date(val.shelfLise)) : null,
                inboundBatch: val.inboundBatch,
            };
            this.setState({
                // 上架数据
                check: check,
                inquire: {
                    ...check,
                },
            });
        }).finally(() => {
            this.setState({ loading: false });
            this.input3Ref?.focus();
        });
    }

    // 请求产品信息
    fetchProductInfo = () => {
        if (!this.state.check.sku) {
            this.setState({ productInfo: {} });
            return;
        }

        this.setState({ loading: true });
        return ProductInfoHelper.fetchProducts([this.state.check.sku]).then(() => {
            let product = ProductInfoHelper.skuToProducts[this.state.check.sku];
            if (product) {
                this.setState({ productInfo: product });
            }
            else {
                message.error('无效的SKU');
            }
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    render() {
        return <div>
            <div className='flex gap-4'>
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}>盘点操作</Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>填写如下信息，然后点击盘点按钮</Typography.Paragraph>
                    <div className='flex flex-wrap'>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>盘点库位</div>
                            <div>
                                <LocationInput
                                    iref={r => this.input1Ref = r}
                                    style={{ width: 250 }}
                                    placeholder='盘点库位'
                                    disabled={this.state.loading}
                                    value={this.state.check.locationCode}
                                    onChange={(val) => {
                                        this.state.check.locationCode = val;
                                        this.setState({});
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.code == 'Enter') {
                                            this.input2Ref?.focus();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>SKU</div>
                            <div>
                                <SkuInput
                                    iref={r => this.input2Ref = r}
                                    value={this.state.check.sku}
                                    onChange={(val) => {
                                        this.state.check.sku = val;
                                        this.setState({});
                                    }}
                                    onSelect={val => {
                                        this.state.check.sku = val;
                                        this.setState({});
                                        this.input3Ref?.focus();
                                        this.fetchLocationSku();
                                        this.fetchProductInfo();
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.code == 'Enter') {
                                            this.input3Ref?.focus();
                                            this.fetchLocationSku();
                                            this.fetchProductInfo();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>盘点数量</div>
                            <div>
                                <InputNumber
                                    ref={r => this.input3Ref = r}
                                    style={{ width: 250 }}
                                    placeholder='盘点数量'
                                    disabled={this.state.loading}
                                    value={this.state.check.quantity}
                                    min={0}
                                    max={999999}
                                    onChange={(val) => {
                                        this.state.check.quantity = val;
                                        this.setState({});
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.code == 'Enter') {
                                            this.fetchCheck();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>保质期</div>
                            <div>
                                <DatePicker
                                    style={{ width: 250 }}
                                    placeholder='保质期'
                                    value={this.state.check.shelfLise}
                                    onChange={(val) => {
                                        this.state.check.shelfLise = val;
                                        this.setState({});
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>入库批次号</div>
                            <div>
                                <Input
                                    style={{ width: 250 }}
                                    placeholder='入库批次号'
                                    value={this.state.check.inboundBatch}
                                    maxLength={consts.MinTextLength}
                                    showCount
                                    onChange={(e) => {
                                        this.state.check.inboundBatch = e.currentTarget.value;
                                        this.setState({});
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <Typography.Paragraph type='warning'>请确认信息是否正确，没什么问题的话，点击如下按钮进行盘点：</Typography.Paragraph>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <Button loading={this.state.loading} type='primary' onClick={this.fetchCheck}>提交改变</Button>
                    </div>
                </div>
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}>盘点的产品信息</Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>如下显示当前要盘点的产品的信息</Typography.Paragraph>
                    <Descriptions bordered layout="vertical">
                        <Descriptions.Item label="SKU">{this.state.productInfo.sku || '--'}</Descriptions.Item>
                        <Descriptions.Item label="产品名">{this.state.productInfo.name || '--'}</Descriptions.Item>
                        <Descriptions.Item label="计量单位">{this.state.productInfo.unit || '--'}</Descriptions.Item>
                        <Descriptions.Item label="体积">{this.state.productInfo.volume} {this.state.productInfo.volumeUnit}</Descriptions.Item>
                        <Descriptions.Item label="重量">{this.state.productInfo.weight} {this.state.productInfo.weightUnit}</Descriptions.Item>
                        <Descriptions.Item label="规格">{this.state.productInfo.specification || '--'}</Descriptions.Item>
                    </Descriptions>
                </div>
            </div>
            <div className='bg-white p-4 rounded shadow mt-4'>
                <Typography.Title level={5}>本次盘点记录</Typography.Title>
                <Typography.Paragraph className='text-gray-400'>如下显示本次盘点的记录</Typography.Paragraph>
                <Table
                    style={{ width: '100%', marginTop: 10 }}
                    columns={[{
                        title: <NumberOutlined />,
                        key: 'index',
                        fixed: 'left',
                        width: 40,
                        render: (val, row, index) => {
                            return index + 1;
                        }
                    }, {
                        title: '库位',
                        key: 'locationCode',
                        dataIndex: 'locationCode',
                    }, {
                        title: 'SKU',
                        key: 'sku',
                        dataIndex: 'sku',
                    }, {
                        title: '产品名称',
                        key: 'sku',
                        dataIndex: 'sku',
                        render: (val, row: any) => {
                            return ProductInfoHelper.skuToProducts[row.sku]?.name;
                        }
                    }, {
                        title: '计量单位',
                        key: 'sku',
                        dataIndex: 'sku',
                        render: (val, row: any) => {
                            return ProductInfoHelper.skuToProducts[row.sku]?.unit;
                        }
                    }, {
                        title: '数量',
                        key: 'quantity',
                        dataIndex: 'quantity',
                    }, {
                        title: '保质期',
                        key: 'shelfLise',
                        dataIndex: 'shelfLise',
                    }, {
                        title: '入库批次号',
                        key: 'inboundBatch',
                        dataIndex: 'inboundBatch',
                    },]}
                    dataSource={this.state.historyDatas}
                    pagination={false}
                />
            </div>
        </div>
    }
}

export default () => {
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;

    return <Page warehouseId={warehouseId} />
};