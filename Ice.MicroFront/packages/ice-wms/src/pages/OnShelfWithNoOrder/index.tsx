import React, { useEffect } from 'react';
import { Typography, DatePicker, Divider, Row, Col, Select, Checkbox, Tag, Table, Button, Space, Input, InputNumber, Modal, message, Descriptions } from 'antd';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';
import { LabelEX, CardEX, Help } from 'ice-layout';
import { Tool, iceFetch } from 'ice-common';
import dayjs from 'dayjs';
import { OnShelfHelp, EnforceOnShelfHelp } from '../../components/Helps';
import EnforceOnShelfCheckBox from '../../components/EnforceOnShelfCheckBox';
import IgnoreSpecCheckBox from '../../components/IgnoreSpecCheckBox';
import LocationInput from '../../components/LocationInput';
import SkuInput from '../../components/SkuInput';
import { IceStateType, ProductInfoApi, ProductInfoHelper, areaSlice, consts } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

type Props = {
    warehouseId: string,
    areas: Array<any>,
    fetchAreas: () => Promise<any>
};

type OnShelfType = {
    sku: string,
    shelvesQuantity: number | null,
    locationCode: string,
    inboundBatch: string,
    shelfLise: null | dayjs.Dayjs,
    // 是否强制上架
    enforce: boolean,
}

class Page extends React.Component<Props> {
    input1Ref: any;
    input2Ref: any;
    input3Ref: any;

    state = {
        loading: false,
        onShelfedList: [] as Array<OnShelfType>,
        // 上架数据
        onShelf: {
            sku: '',
            shelvesQuantity: 0,
            locationCode: '',
            inboundBatch: '',
            shelfLise: null as (null | dayjs.Dayjs),
            // 是否强制上架
            enforce: false,
        } as OnShelfType,
        // 当前SKU信息
        productInfo: {} as any,
        // 忽略规格检查
        ignoreSpecCheck: false,
    }

    componentDidMount() {
        this.input1Ref?.focus();

        this.setState({ loading: true });
        this.props.fetchAreas().finally(() => {
            this.setState({ loading: false });
        });
    }

    // 自动生成入库批次号
    createInboundBatchClick = () => {
        let timestr = Tool.dateFormat(new Date(), 'yyMMdd');
        this.state.onShelf.inboundBatch = timestr!;
        this.setState({});
    }

    // 上架
    fetchOnShelf = async () => {
        if (this.state.loading == true) {
            return false;
        }

        if (!this.state.onShelf.sku) {
            message.error('请输入SKU');
            return false;
        }

        if (!this.state.onShelf.shelvesQuantity) {
            message.error('请输入上架数量');
            return false;
        }

        if (!this.state.onShelf.locationCode) {
            message.error('请输入上架库位');
            return false;
        }

        if (!this.state.onShelf.shelvesQuantity) {
            message.error('请输入上架数量');
            return false;
        }

        // 判断SKU的规格是否允许上架到库区
        if (this.state.ignoreSpecCheck == false) {
            // 查找对应的库区
            let area = this.props.areas.find(area => this.state.onShelf.locationCode.startsWith(area.code));
            // 进行规格检查
            let result = await ProductInfoHelper.specCheck(this.state.onShelf.sku, area.allowSpecifications, area.forbidSpecifications);
            if (result.allow == false) {
                message.error(`SKU: ${this.state.onShelf.sku}, 规格: ${result.allowSpec || result.forbidSpec} 不能上架到库区 ${area.code}`);
                return false;
            }
        }

        let shelfLise;
        if (this.state.onShelf.shelfLise) {
            shelfLise = Tool.dateFormat(this.state.onShelf.shelfLise.toDate(), 'yyyy-MM-ddT00:00:00.000Z');
        }

        await ProductInfoHelper.fetchProducts([this.state.onShelf.sku]);
        let curProduct = ProductInfoHelper.skuToProducts[this.state.onShelf.sku];
        this.setState({ loading: true });
        return iceFetch(`/api/wms/on-off-shelf/on-shelf-with-no-order`, {
            method: 'PUT',
            body: JSON.stringify({
                warehouseId: this.props.warehouseId,
                sku: this.state.onShelf.sku,
                quantity: this.state.onShelf.shelvesQuantity,
                locationCode: this.state.onShelf.locationCode,
                inboundBatch: this.state.onShelf.inboundBatch,
                shelfLise: shelfLise,
                enforce: this.state.onShelf.enforce,
            })
        }).then(() => {
            message.success(`SKU: ${this.state.onShelf.sku}上架成功`);
            let onShelfedList = [
                ...this.state.onShelfedList,
                {
                    ...this.state.onShelf
                }
            ];

            this.setState({
                // 上架数据
                onShelf: {
                    ...this.state.onShelf,
                    sku: '',
                    shelvesQuantity: 0,
                },
                onShelfedList: onShelfedList
            });
            this.input2Ref?.focus();
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    // 请求产品信息
    fetchProductInfo = () => {
        if (!this.state.onShelf.sku) {
            this.setState({ productInfo: {} });
            return;
        }

        this.setState({ loading: true });
        return ProductInfoHelper.fetchProducts([this.state.onShelf.sku]).then(() => {
            let product = ProductInfoHelper.skuToProducts[this.state.onShelf.sku];
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
                {/* 操作 */}
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}><Space><span>上架操作</span><OnShelfHelp /></Space></Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>填写如下信息，然后点击上架按钮</Typography.Paragraph>
                    <div className='flex flex-wrap'>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>上架库位</div>
                            <div>
                                <LocationInput
                                    iref={r => this.input1Ref = r}
                                    style={{ width: 250 }}
                                    placeholder='上架库位'
                                    value={this.state.onShelf.locationCode}
                                    onChange={(val) => {
                                        this.state.onShelf.locationCode = val;
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
                                    value={this.state.onShelf.sku}
                                    onChange={(val) => {
                                        this.state.onShelf.sku = val;
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
                                        this.state.onShelf.sku = val;
                                        this.setState({});
                                        this.input3Ref?.focus();
                                        this.fetchProductInfo();
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>上架数量</div>
                            <div>
                                <InputNumber
                                    ref={r => this.input3Ref = r}
                                    style={{ width: 250 }}
                                    placeholder='上架数量'
                                    value={this.state.onShelf.shelvesQuantity}
                                    min={0}
                                    max={999999}
                                    onChange={(val) => {
                                        this.state.onShelf.shelvesQuantity = val;
                                        this.setState({});
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.code == 'Enter') {
                                            this.fetchOnShelf();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>批次号</div>
                            <div>
                                <Input
                                    style={{ width: 250 }}
                                    addonAfter={<Button size='small' type='text' onClick={this.createInboundBatchClick}>生成</Button>}
                                    placeholder='批次号'
                                    value={this.state.onShelf.inboundBatch}
                                    maxLength={consts.MinTextLength}
                                    onChange={(e) => {
                                        this.state.onShelf.inboundBatch = e.currentTarget.value;
                                        this.setState({});
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-full mb-4'>
                            <div className='mb-2'>保质期</div>
                            <div>
                                <DatePicker
                                    placeholder='保质期'
                                    style={{ width: '100%' }}
                                    value={this.state.onShelf.shelfLise}
                                    onChange={val => {
                                        this.state.onShelf.shelfLise = val;
                                        this.setState({});
                                    }}
                                ></DatePicker>
                            </div>
                        </div>
                    </div>
                    <Typography.Paragraph type='warning'>请确认信息是否正确，没什么问题的话，点击如下按钮进行上架：</Typography.Paragraph>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <Space size='large'>
                            <Button loading={this.state.loading} type='primary' onClick={this.fetchOnShelf}>上架</Button>
                            <EnforceOnShelfCheckBox
                                checked={this.state.onShelf.enforce}
                                onChange={val => {
                                    this.state.onShelf.enforce = val;
                                    this.setState({});
                                }}
                            />
                            <IgnoreSpecCheckBox
                                checked={this.state.ignoreSpecCheck}
                                onChange={val => {
                                    this.state.ignoreSpecCheck = val;
                                    this.setState({});
                                }}
                            />
                        </Space>
                    </div>
                </div>
                {/* 信息 */}
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}>上架的产品信息</Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>如下显示当前要上架的产品的信息</Typography.Paragraph>
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
                <Typography.Title level={5}>已上架数据</Typography.Title>
                <Typography.Paragraph className='text-gray-400'>如下显示本次操作已上架的产品的信息</Typography.Paragraph>
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
                        title: '数量',
                        key: 'shelvesQuantity',
                        dataIndex: 'shelvesQuantity',
                    }, {
                        title: '库位',
                        key: 'locationCode',
                        dataIndex: 'locationCode',
                    }, {
                        title: '批次号',
                        key: 'inboundBatch',
                        dataIndex: 'inboundBatch',
                    }, {
                        title: '保质期',
                        key: 'shelfLise',
                        dataIndex: 'shelfLise',
                        render: (val, row) => {
                            return Tool.dateFormat(row.shelfLise?.toDate() || null);
                        }
                    }]}
                    dataSource={this.state.onShelfedList}
                    pagination={false}
                />
            </div>
        </div>
    }
}

export default () => {
    const dispatch = useDispatch();
    const areas = useSelector((state: IceStateType) => state.area.allDatas) || [];
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    const navigate = useNavigate();
    const fetchDatas = async () => {
        return dispatch(areaSlice.asyncActions.fetchAllDatas({}) as any);
    }

    useEffect(() => {
        fetchDatas();
    }, []);

    return <Page
        warehouseId={warehouseId}
        areas={areas}
        fetchAreas={fetchDatas}
    />
};