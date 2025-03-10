import React, { useEffect } from 'react';
import { Typography, DatePicker, Divider, Row, Col, Select, Checkbox, Tag, Table, Button, Space, Input, InputNumber, Modal, message, Descriptions } from 'antd';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';
import { LabelEX, CardEX, Help } from 'ice-layout';
import { iceFetch } from 'ice-common';
import LocationInput from '../../components/LocationInput';
import SkuInput from '../../components/SkuInput';
import { IceStateType, ProductInfoApi, ProductInfoHelper } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

let { Title } = Typography;

type Props = {
    warehouseId: string,
};

type OffShelfType = {
    sku: string,
    quantity: number | null,
    locationCode: string,
}

class Page extends React.Component<Props> {
    input1Ref: any;
    input2Ref: any;
    input3Ref: any;

    state = {
        loading: false,
        offShelfedList: [] as Array<OffShelfType>,
        // 下架数据
        offShelf: {
            sku: '',
            quantity: 0,
            locationCode: '',
        } as OffShelfType,
        // 当前SKU信息
        productInfo: {} as any
    }

    componentDidMount() {
        this.input1Ref?.focus();
    }

    // 上架
    fetchOffShelf = () => {
        if (!this.state.offShelf.sku) {
            message.error('请输入SKU');
            return false;
        }

        if (!this.state.offShelf.quantity) {
            message.error('请输入下架数量');
            return false;
        }

        if (!this.state.offShelf.locationCode) {
            message.error('请输入下架库位');
            return false;
        }

        this.setState({ loading: true });
        return iceFetch(`/api/wms/on-off-shelf/off-shelf-with-no-order`, {
            method: 'PUT',
            body: JSON.stringify({
                warehouseId: this.props.warehouseId,
                "sku": this.state.offShelf.sku,
                "quantity": this.state.offShelf.quantity,
                "locationCode": this.state.offShelf.locationCode,
            })
        }).then(() => {
            message.success(`SKU: ${this.state.offShelf.sku}下架成功`);
            let offShelfedList = [
                ...this.state.offShelfedList,
                {
                    ...this.state.offShelf
                }
            ];

            this.setState({
                // 下架数据
                offShelf: {
                    ...this.state.offShelf,
                    sku: '',
                    quantity: 0,
                },
                offShelfedList: offShelfedList
            });
            this.input2Ref?.focus();
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    // 请求产品信息
    fetchProductInfo = () => {
        if (!this.state.offShelf.sku) {
            this.setState({ productInfo: {} });
            return;
        }

        return ProductInfoHelper.fetchProducts([this.state.offShelf.sku]).then(() => {
            let product = ProductInfoHelper.skuToProducts[this.state.offShelf.sku];
            if (product) {
                this.setState({ productInfo: product });
            }
            else {
                message.error('无效的SKU');
            }
        });
    }

    render() {
        return <div>
            <div className='flex gap-4'>
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}>下架操作</Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>填写如下信息，然后点击下架按钮</Typography.Paragraph>
                    <div className='flex flex-wrap'>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>下架库位</div>
                            <div>
                                <LocationInput
                                    iref={r => this.input1Ref = r}
                                    style={{ width: 250 }}
                                    placeholder='下架库位'
                                    value={this.state.offShelf.locationCode}
                                    onChange={(val) => {
                                        this.state.offShelf.locationCode = val;
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
                                    style={{ width: 250 }}
                                    value={this.state.offShelf.sku}
                                    onChange={(val) => {
                                        this.state.offShelf.sku = val;
                                        this.setState({});
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.code == 'Enter') {
                                            this.input3Ref?.focus();
                                            this.fetchProductInfo();
                                        }
                                    }}
                                    onBlur={() => {
                                        this.fetchProductInfo();
                                    }}
                                    onSelect={val => {
                                        this.state.offShelf.sku = val;
                                        this.setState({});
                                        this.input3Ref?.focus();
                                        this.fetchProductInfo();
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>下架数量</div>
                            <div>
                                <InputNumber
                                    ref={r => this.input3Ref = r}
                                    style={{ width: 250 }}
                                    placeholder='下架数量'
                                    value={this.state.offShelf.quantity}
                                    min={0}
                                    max={999999}
                                    onChange={(val) => {
                                        this.state.offShelf.quantity = val;
                                        this.setState({});
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.code == 'Enter') {
                                            this.fetchOffShelf();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <Typography.Paragraph type='warning'>请确认信息是否正确，没什么问题的话，点击如下按钮进行下架：</Typography.Paragraph>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <Space size='large'>
                            <Button loading={this.state.loading} type='primary' onClick={this.fetchOffShelf}>下架</Button>
                        </Space>
                    </div>
                </div>
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}>下架的产品信息</Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>如下显示当前要下架的产品的信息</Typography.Paragraph>
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
            <div className='bg-white p-4 rounded shadow mt-8'>
                <Typography.Title level={5}>已下架数据</Typography.Title>
                <Typography.Paragraph className='text-gray-400'>如下显示本次操作已下架的产品的信息</Typography.Paragraph>
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
                    }, {
                        title: '产品名称',
                        key: 'sku',
                        dataIndex: 'sku',
                        render: (val, row) => {
                            return ProductInfoHelper.skuToProducts[row.sku]?.name;
                        }
                    }, {
                        title: '计量单位',
                        key: 'sku',
                        dataIndex: 'sku',
                        render: (val, row) => {
                            return ProductInfoHelper.skuToProducts[row.sku]?.unit;
                        }
                    }, {
                        title: '下架数量',
                        key: 'quantity',
                        dataIndex: 'quantity',
                    }, {
                        title: '库位',
                        key: 'locationCode',
                        dataIndex: 'locationCode',
                    }]}
                    dataSource={this.state.offShelfedList}
                    pagination={false}
                />
            </div>
        </div>
    }
}

export default () => {
    const dispatch = useDispatch();
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;

    return <Page
        warehouseId={warehouseId}
    />
};