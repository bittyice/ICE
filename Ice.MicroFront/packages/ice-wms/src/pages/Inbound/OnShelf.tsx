import React from 'react';
import { Typography, Card, Cascader, Row, Col, Select, Divider, InputNumber, Table, Button, Space, Input, Modal, message, Switch, Descriptions } from 'antd';
import { Tool } from 'ice-common';
import { consts, InboundOrderApi, InboundOrderEntity, WarehouseEntity, IceStateType, ProductInfoHelper, LabelValues, enums, areaSlice, inboundOrderSlice } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput, Help, ExtraInfo, ProductInfoModal } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import EnforceOnShelfCheckBox from '../../components/EnforceOnShelfCheckBox';
import IgnoreSpecCheckBox from '../../components/IgnoreSpecCheckBox';
import LocationInput from '../../components/LocationInput';
import SkuInput from '../../components/SkuInput';
import { OnShelfHelp } from '../../components/Helps';
import { useNavigate } from 'react-router';

type Props = {
    warehouseId: string,
    fetchAreas: () => Promise<any>,
    areas: Array<any>,
    navigate: (url: any) => void,
    onOk: () => Promise<any>,
};

class Page extends React.Component<Props> {
    input1Ref: any;
    input2Ref: any;
    input3Ref: any;

    state = {
        id: Tool.getUrlVariable(window.location.search, 'id'),
        loading: false,
        entity: {
            inboundNumber: '',
            inboundBatch: '',
            type: enums.InboundOrderType.Purchase,
            inboundDetails: []
        } as InboundOrderEntity,
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
        // 推荐上架库位
        recommendOnShelfLocation: null as ({
            minQuantityLocation: string | null,
            maxQuantityLocation: string | null,
            someShelfLiseLocation: string | null
        } | null)
    }

    componentDidMount() {
        this.input1Ref?.focus();

        this.setState({ loading: true });
        Promise.all([
            this.props.fetchAreas(),
            this.fetchEntity(),
        ]).finally(() => {
            this.setState({ loading: false });
        });
    }

    fetchEntity = async () => {
        var entity = await InboundOrderApi.get(this.state.id!);
        this.setState({ entity: entity });
        ProductInfoHelper.fetchProducts(entity.inboundDetails!.map((e: any) => e.sku)).then(() => {
            this.setState({});
        });
        return entity;
    }

    // 选择SKU
    skuSelect = (sku: string) => {
        let inboundDetail = this.state.entity.inboundDetails!.find((e: any) => e.sku == sku);
        if (!inboundDetail) {
            message.error('入库单不存在该SKU，请检查输入的SKU是否正确');
            return;
        }

        let shelvesQuantity = inboundDetail.actualQuantity! - inboundDetail.shelvesQuantity!;
        this.setState({
            onShelf: {
                ...this.state.onShelf,
                sku: sku,
                shelvesQuantity: shelvesQuantity > 0 ? shelvesQuantity : 0,
                locationCode: '',
            }
        });
        this.input2Ref?.focus();

        message.success('请输入上架数量');
        this.fetchRecommendOnShelfLocation(inboundDetail.sku!, inboundDetail.shelfLise);
    }

    // 上架
    fetchOnShelf = async () => {
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

        this.setState({ loading: true });
        try {
            await InboundOrderApi.onShelf({
                id: this.state.id!,
                sku: this.state.onShelf.sku,
                quantity: this.state.onShelf.shelvesQuantity,
                locationCode: this.state.onShelf.locationCode,
                enforce: this.state.onShelf.enforce
            })
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

            let val: InboundOrderEntity = await this.fetchEntity();

            let inboundDetails = val.inboundDetails!;

            // 检查是否有实际数量小于预报数量
            for (let inboundDetail of inboundDetails) {
                if (inboundDetail.shelvesQuantity! < inboundDetail.actualQuantity!) {
                    this.setState({ loading: false });
                    return;
                }
            }

            Modal.confirm({
                title: `完成上架 - ${this.state.entity.inboundNumber}`,
                content: '订单已全部上架，是否完成上架？',
                onOk: () => {
                    this.fetchFinishOnShelf();
                }
            });
        } catch { }
        this.setState({ loading: false });
        return true;
    }

    // 完成订单
    fetchFinishOnShelf = async () => {
        this.setState({ loading: true });

        try {
            await InboundOrderApi.finishOnShelf(this.state.id!);
            message.success(`订单${this.state.entity.inboundNumber}已完成上架`);
            await this.props.onOk();
            this.props.navigate(-1);
        } catch { }

        this.setState({ loading: false });
    }

    // 请求推荐上架库位
    fetchRecommendOnShelfLocation = (sku: string, shelfLise?: string,) => {
        InboundOrderApi.getRecommendOnShelfLocation({
            warehouseId: this.props.warehouseId,
            sku: sku,
            shelfLise: shelfLise
        }).then((datas) => {
            this.setState({
                recommendOnShelfLocation: datas
            });
        });
    }

    render() {
        return <div>
            <div className='flex gap-4'>
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
                                    onSelect={val => {
                                        this.state.onShelf.sku = val;
                                        this.setState({});
                                        this.skuSelect(this.state.onShelf.sku);
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.code == 'Enter') {
                                            this.skuSelect(this.state.onShelf.sku);
                                        }
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
                                            this.fetchOnShelf();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <Typography.Paragraph type='warning'>请确认信息是否正确，没什么问题的话，点击如下按钮进行上架：</Typography.Paragraph>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <Space split={<Divider type='vertical' />}>
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
                        <Button loading={this.state.loading} onClick={() => {
                            Modal.confirm({
                                title: `强制完成上架 - ${this.state.entity.inboundNumber}`,
                                content: '确定强制完成上架吗？该操作不可撤销',
                                onOk: () => {
                                    this.fetchFinishOnShelf();
                                }
                            });
                        }}>强制完成上架</Button>
                    </div>
                    {
                        this.state.recommendOnShelfLocation &&
                        <Space className='mt-4' split={<Divider type="vertical" />}>
                            <span>推荐上架库位</span>
                            {
                                this.state.recommendOnShelfLocation.minQuantityLocation &&
                                <a href="javascript:void(0)"
                                    onClick={() => {
                                        this.state.onShelf.locationCode = this.state.recommendOnShelfLocation!.minQuantityLocation!;
                                        this.setState({});
                                        this.input3Ref?.focus();
                                    }}
                                >{`${this.state.recommendOnShelfLocation.minQuantityLocation} [SKU相同库存数量最小]`}</a>
                            }
                            {
                                this.state.recommendOnShelfLocation.maxQuantityLocation &&
                                <a href="javascript:void(0)"
                                    onClick={() => {
                                        this.state.onShelf.locationCode = this.state.recommendOnShelfLocation!.maxQuantityLocation!;
                                        this.setState({});
                                        this.input3Ref?.focus();
                                    }}
                                >{`${this.state.recommendOnShelfLocation.maxQuantityLocation} [SKU相同数量库存最大]`}</a>
                            }
                            {
                                this.state.recommendOnShelfLocation.someShelfLiseLocation &&
                                <a href="javascript:void(0)"
                                    onClick={() => {
                                        this.state.onShelf.locationCode = this.state.recommendOnShelfLocation!.someShelfLiseLocation!;
                                        this.setState({});
                                        this.input3Ref?.focus();
                                    }}
                                >{`${this.state.recommendOnShelfLocation.someShelfLiseLocation} [SKU相同且保质期相同]`}</a>
                            }
                        </Space>
                    }
                </div>
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}>上架的产品信息</Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>如下显示当前要上架的产品的信息</Typography.Paragraph>
                    <Descriptions bordered layout="vertical">
                        <Descriptions.Item label="SKU">{ProductInfoHelper.skuToProducts[this.state.onShelf.sku]?.sku || '--'}</Descriptions.Item>
                        <Descriptions.Item label="产品名">{ProductInfoHelper.skuToProducts[this.state.onShelf.sku]?.name || '--'}</Descriptions.Item>
                        <Descriptions.Item label="计量单位">{ProductInfoHelper.skuToProducts[this.state.onShelf.sku]?.unit || '--'}</Descriptions.Item>
                        <Descriptions.Item label="体积">{ProductInfoHelper.skuToProducts[this.state.onShelf.sku]?.volume} {ProductInfoHelper.skuToProducts[this.state.onShelf.sku]?.volumeUnit}</Descriptions.Item>
                        <Descriptions.Item label="重量">{ProductInfoHelper.skuToProducts[this.state.onShelf.sku]?.weight} {ProductInfoHelper.skuToProducts[this.state.onShelf.sku]?.weightUnit}</Descriptions.Item>
                        <Descriptions.Item label="规格">{ProductInfoHelper.skuToProducts[this.state.onShelf.sku]?.specification || '--'}</Descriptions.Item>
                    </Descriptions>
                </div>
            </div>
            <div className='bg-white p-4 rounded shadow mt-4'>
                <Typography.Title level={5}>基本信息</Typography.Title>
                <Typography.Paragraph className='text-gray-400'>如下显示入库单的信息</Typography.Paragraph>
                <Descriptions bordered layout="vertical">
                    <Descriptions.Item label="入库单号">{this.state.entity.inboundNumber}</Descriptions.Item>
                    <Descriptions.Item label="入库批次号">{this.state.entity.inboundBatch}</Descriptions.Item>
                    <Descriptions.Item label="入库类型">{LabelValues.InboundOrderType.find(e => e.value === this.state.entity.type)?.label}</Descriptions.Item>
                </Descriptions>
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
                        render: (val) => {
                            return <a href='javascript:void(0)' onClick={() => {
                                this.skuSelect(val);
                            }}>{val}</a>
                        }
                    }, {
                        title: '名称',
                        key: 'name',
                        dataIndex: 'name',
                        render: (val, row) => {
                            return ProductInfoHelper.skuToProducts[row.sku!]?.name;
                        }
                    }, {
                        title: '预报数量',
                        key: 'forecastQuantity',
                        dataIndex: 'forecastQuantity',
                    }, {
                        title: '实际数量',
                        key: 'actualQuantity',
                        dataIndex: 'actualQuantity',
                        render: (val) => {
                            return <span style={{ color: '#52c41a' }}>{val}</span>
                        }
                    }, {
                        title: '上架数量',
                        key: 'shelvesQuantity',
                        dataIndex: 'shelvesQuantity',
                        render: (val) => {
                            return <span style={{ color: '#eb2f96' }}>{val}</span>
                        }
                    }, {
                        title: '保质期',
                        key: 'shelfLise',
                        dataIndex: 'shelfLise',
                        render: (val, row) => {
                            return Tool.dateFormat(val, 'yyyy-MM-dd');
                        }
                    }, {
                        title: '规格',
                        key: 'specification',
                        dataIndex: 'specification',
                        render: (val, row) => {
                            return ProductInfoHelper.skuToProducts[row.sku!]?.specification;
                        }
                    }]}
                    dataSource={this.state.entity.inboundDetails}
                    pagination={false}
                />
            </div>
        </div>
    }
}

export default () => {
    const dispatch = useDispatch();
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    const areas = useSelector((state: IceStateType) => state.area.allDatas) || [];
    const navigate = useNavigate();

    const fetchDatas = async () => {
        dispatch(areaSlice.asyncActions.fetchAllDatas({}) as any);
    }

    const onOk = async () => {
        await dispatch(inboundOrderSlice.asyncActions.refreshPageDatas({}) as any);
    }

    return <Page
        warehouseId={warehouseId}
        navigate={navigate}
        areas={areas}
        fetchAreas={fetchDatas}
        onOk={onOk}
    />
}