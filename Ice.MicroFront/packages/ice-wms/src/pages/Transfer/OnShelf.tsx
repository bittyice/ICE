import React, { useEffect, useState } from 'react';
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
import { IceStateType, ProductInfoApi, ProductInfoHelper, TransferSkuApi, areaSlice, consts } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import './index.css'

const SelectSkuModal = (props: {
    visible: boolean,
    onCancel: () => void,
    onOk: (transferSkuId: string) => void,
    transferSkus: Array<any>
}) => {
    const [selectId, setSelectId] = useState(null);

    return <Modal
        title='请选择要上架哪个SKU'
        open={props.visible}
        onCancel={props.onCancel}
        onOk={() => {
            if (!selectId) {
                message.warning('请选择SKU');
                return;
            }

            props.onOk(selectId);
        }}
    >
        <div className='transfer-selectsku'>
            {
                props.transferSkus.map(item => (
                    <div
                        style={{ borderColor: item.id == selectId ? '#1890ff' : undefined }}
                        className='transfer-selectsku-item'
                        onClick={() => {
                            setSelectId(item.id);
                        }}
                    >
                        <LabelEX text={'SKU'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>{item.sku}</LabelEX>
                        <LabelEX text={'入库批次号'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>{item.inboundBatch}</LabelEX>
                        <LabelEX text={'过期时间'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>{Tool.dateFormat(item.shelfLise, 'yyyy-MM-dd')}</LabelEX>
                        <LabelEX text={'数量'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>{item.quantity}</LabelEX>
                    </div>))
            }
        </div>
    </Modal>
}

type Props = {
    warehouseId: string,
    areas: Array<any>,
    fetchAreas: () => Promise<any>
};

class Page extends React.Component<Props> {
    input1Ref: any;
    input2Ref: any;
    input3Ref: any;

    state = {
        id: Tool.getUrlVariable(window.location.search, 'id'),
        loading: false,
        // 上架数据
        onShelf: {
            sku: '',
            shelvesQuantity: 0 as (number | null),
            locationCode: '',
            // 是否强制上架
            enforce: false,
        },
        // 忽略规格检查
        ignoreSpecCheck: false,
        transferSkus: [] as Array<any>,
        showSelectSku: false,
    }

    componentDidMount() {
        this.input1Ref?.focus();

        this.setState({ loading: true });
        this.props.fetchAreas().finally(() => {
            this.setState({ loading: false });
        });
    }

    // 上架
    onShelf = async () => {
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

        // 请求 transferSkuId
        TransferSkuApi.findTransferSkus({
            warehouseId: this.props.warehouseId,
            sku: this.state.onShelf.sku,
        }).then((datas: Array<any>) => {
            if (datas.length == 0) {
                message.error('无效的SKU');
                return;
            }

            if (datas.length == 1) {
                this.fetchOnShelf(datas[0].id);
                return;
            }

            this.setState({
                transferSkus: datas,
                showSelectSku: true,
            });
        });
        return true;
    }

    fetchOnShelf = (transferSkuId: string) => {
        this.setState({ loading: true });
        TransferSkuApi.onShelf({
            transferSkuId: transferSkuId,
            quantity: this.state.onShelf.shelvesQuantity || 0,
            locationCode: this.state.onShelf.locationCode,
            enforce: this.state.onShelf.enforce,
            warehouseId: this.props.warehouseId,
        }).then(() => {
            message.success(`SKU: ${this.state.onShelf.sku}上架成功`);
            this.setState({
                // 上架数据
                onShelf: {
                    sku: '',
                    shelvesQuantity: 0,
                    locationCode: '',
                    enforce: this.state.onShelf.enforce
                }
            });
            this.input1Ref?.focus();
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    // 请求产品信息
    fetchProductInfo = () => {
        this.setState({ loading: true });
        ProductInfoHelper.fetchProducts([this.state.onShelf.sku]).finally(() => {
            this.setState({ loading: false });
        });
    }

    render() {
        let productInfo = ProductInfoHelper.skuToProducts[this.state.onShelf.sku] || {};
        return <div className='flex gap-4'>
            <div className=' bg-white p-4 rounded shadow w-2/4'>
                <Typography.Title level={5}><Space><span>上架操作</span><OnShelfHelp /></Space></Typography.Title>
                <Typography.Paragraph className='text-gray-400'>填写如下信息，然后点击上架按钮</Typography.Paragraph>
                <div className='flex flex-wrap'>
                    <div className='w-1/2 mb-4'>
                        <div className='mb-2'>SKU</div>
                        <div>
                            <SkuInput
                                iref={r => this.input1Ref = r}
                                value={this.state.onShelf.sku}
                                onChange={(val) => {
                                    this.state.onShelf.sku = val;
                                    this.setState({});
                                }}
                                onKeyDown={(event) => {
                                    if (event.code == 'Enter') {
                                        this.input2Ref?.focus();
                                        this.fetchProductInfo();
                                    }
                                }}
                                onBlur={() => {
                                    this.fetchProductInfo();
                                }}
                                onSelect={val => {
                                    this.state.onShelf.sku = val;
                                    this.setState({});
                                    this.input2Ref?.focus();
                                    this.fetchProductInfo();
                                }}
                            />
                        </div>
                    </div>
                    <div className='w-1/2 mb-4'>
                        <div className='mb-2'>上架数量</div>
                        <div>
                            <InputNumber
                                ref={r => this.input2Ref = r}
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
                                        this.input3Ref?.focus();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className='w-1/2 mb-4'>
                        <div className='mb-2'>上架库位</div>
                        <div>
                            <LocationInput
                                iref={r => this.input3Ref = r}
                                style={{ width: 250 }}
                                placeholder='上架库位'
                                value={this.state.onShelf.locationCode}
                                onChange={(val) => {
                                    this.state.onShelf.locationCode = val;
                                    this.setState({});
                                }}
                                onKeyDown={(event) => {
                                    if (event.code == 'Enter') {
                                        this.onShelf();
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className='mb-2'>点击如下按钮进行上架：</div>
                <Space split={<Divider type='vertical' />}>
                    <Button loading={this.state.loading} type='primary' onClick={this.onShelf}>上架</Button>
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
                <SelectSkuModal
                    visible={this.state.showSelectSku}
                    onCancel={() => {
                        this.setState({ showSelectSku: false });
                    }}
                    onOk={(transferSkuId) => {
                        this.fetchOnShelf(transferSkuId);
                        this.setState({ showSelectSku: false });
                    }}
                    transferSkus={this.state.transferSkus}
                />
            </div>
            <div className=' bg-white p-4 rounded shadow w-2/4'>
                <Typography.Title level={5}>上架的产品信息</Typography.Title>
                <Typography.Paragraph className='text-gray-400'>如下显示当前要上架的产品的信息</Typography.Paragraph>
                <Descriptions bordered layout="vertical">
                    <Descriptions.Item label="SKU">{productInfo.sku || '--'}</Descriptions.Item>
                    <Descriptions.Item label="产品名">{productInfo.name || '--'}</Descriptions.Item>
                    <Descriptions.Item label="计量单位">{productInfo.unit || '--'}</Descriptions.Item>
                    <Descriptions.Item label="体积">{productInfo.volume} {productInfo.volumeUnit}</Descriptions.Item>
                    <Descriptions.Item label="重量">{productInfo.weight} {productInfo.weightUnit}</Descriptions.Item>
                    <Descriptions.Item label="规格">{productInfo.specification || '--'}</Descriptions.Item>
                </Descriptions>
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