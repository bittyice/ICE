import React from 'react';
import { Typography, Radio, Tag, Row, Tabs, Select, DatePicker, InputNumber, Table, Button, Space, Input, Modal, message, Switch, Descriptions } from 'antd';
import { Tool, iceFetch, Storage } from 'ice-common';
import { consts, OutboundOrderApi, OutboundOrderEntity, PickListApi, PickListEntity, IceStateType, enums, ProductInfoHelper, ChinaAreaCodeHelper, LabelValues, PickPathItemType, CreatePickPath, AlgorithmType, pickListSlice } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput, Help, ExtraInfo, ProductInfoModal, AddressBookModal } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { NumberOutlined, DeleteOutlined, ArrowDownOutlined } from '@ant-design/icons';
import LocationInput from '../../components/LocationInput';
import SkuInput from '../../components/SkuInput';

let { Title } = Typography;

const PickHelp = () => {
    const HelpContent = <div>
        <Typography.Paragraph style={{ marginTop: 10 }}>1. 输入SKU，拣货数量，拣货库位（按回车光标会自动跳转）</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>2. 点击"拣货"按钮进行拣货（也可以在"拣货库位"输入框按回车进行拣货）</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>3. 当所有明细的"已拣货数量"大于"需拣货数量"，会提示是否完成拣货，点击确认可完成拣货，完成拣货后拣货单状态变成"已完成"，关联的出库单状态变成待出库</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>4. 点击"强制完成拣货"可强制完成拣货，完成拣货后订单状态变成"已完成"，关联的出库单状态变成待出库</Typography.Paragraph>
    </div>

    return <Help title='拣货操作说明' body={HelpContent} />
}

type PickPathProps = {
    algorithmType: string,
    onAlgorithmChange: (algorithmType: string) => void,
    rebuildPickPaths: () => Promise<void>,
    pickPaths: Array<PickPathItemType>,
    onClick: (pickPath: PickPathItemType) => void
}

const PickPath = (props: PickPathProps) => {
    return <>
        <Space style={{ display: 'flex', width: '100%' }}>
            <span>拣货路径</span>
            <ArrowDownOutlined />
            <Radio.Group
                value={props.algorithmType}
                onChange={(e) => {
                    props.onAlgorithmChange(e.target.value);
                }}
            >
                <Radio value='Location'>按库位顺序拣货</Radio>
                <Radio value='Quantity'>优先拣库存较小的库位</Radio>
                <Radio value='InboundBatch'>按入库批次号拣货</Radio>
            </Radio.Group>
            <Button size='small' type='primary' onClick={props.rebuildPickPaths}>重新生成</Button>
        </Space>
        <Space className='mt-2' style={{ flexWrap: 'wrap' }}>
            {
                props.pickPaths.map(item => (<a
                    style={{
                        paddingRight: 8,
                        borderRight: '1px solid #1890ff'
                    }}
                    href='javascript:void(0)'
                    onClick={() => {
                        props.onClick(item);
                    }}
                >{`${item.locationCode} -> ${ProductInfoHelper.skuToProducts[item.sku]?.name || item.sku} -> ${item.needPickQuantity}个 -> ${item.orderIndex}号单[...${item.orderNumber.substring(item.orderNumber.length - 4)}]`}</a>))
            }
        </Space>
    </>
}

type Props = {
    navigate: (url: any) => void,
    onOk: () => Promise<any>,
};

class Page extends React.Component<Props> {
    pickPathStorageName = "PickPathAlgorithmType";
    input1Ref: any;
    input2Ref: any;
    input3Ref: any;
    createPickPath!: CreatePickPath;

    state = {
        init: false,
        id: Tool.getUrlVariable(window.location.search, 'id'),
        loading: false,
        // 拣货路径算法
        algorithmType: 'Location' as AlgorithmType,
        // 拣货数据
        pick: {
            sku: '',
            quantity: 0 as (number | null),
            locationCode: '',
            orderId: null
        },
        pickPathKey: 0,
        // 拣货路径
        pickPaths: [] as Array<PickPathItemType>
    }

    componentDidMount() {
        if (!this.state.id) {
            return;
        }
        this.init();
    }

    async init() {
        this.createPickPath = new CreatePickPath();
        await this.createPickPath.init(this.state.id);
        await ProductInfoHelper.fetchProducts(this.createPickPath.pickDetails.map((e) => e.sku));
        this.input1Ref?.focus();
        let algorithmType = await Storage.getItem(this.pickPathStorageName);
        let pickPaths = this.createPickPath.createPickPaths(algorithmType as AlgorithmType);
        if (this.createPickPath.outboundOrders.length == 1) {
            this.state.pick.orderId = this.createPickPath.outboundOrders[0].id;
        }
        this.setState({ algorithmType: algorithmType, pickPaths: pickPaths, init: true });
    }

    // 拣货
    fetchPick = () => {
        if (!this.state.pick.orderId) {
            message.error("请选择要选择的订单");
            return;
        }

        if (!this.state.pick.sku) {
            message.error("请输入SKU");
            return;
        }

        if (!this.state.pick.quantity) {
            message.error("请输入拣货数量");
            return;
        }

        if (!this.state.pick.locationCode) {
            message.error("请输入拣货库位");
            return;
        }

        this.setState({ loading: true });
        let orderId = this.state.pick.orderId;
        let params = {
            id: orderId,
            locationCode: this.state.pick.locationCode,
            sku: this.state.pick.sku,
            quantity: this.state.pick.quantity
        }
        OutboundOrderApi.pick(params).then(() => {
            message.success("成功");
            this.setState({
                pick: {
                    ...this.state.pick,
                    locationCode: '',
                    sku: '',
                    quantity: 0
                }
            }, () => {
                // 这是ant的一个bug，必须使用setTimeout
                setTimeout(() => {
                    this.input1Ref?.focus();
                }, 1);
            });
        }).then(() => {
            // 重新计算路径
            this.createPickPath.pick(orderId, params.sku, params.quantity, params.locationCode);
            let pickPaths = this.createPickPath.createPickPaths(this.state.algorithmType);
            this.setState({ pickPaths: pickPaths });
            if (pickPaths.length == 0) {
                Modal.confirm({
                    title: `完成拣货`,
                    content: '拣货单已全部拣完，是否完成拣货？',
                    onOk: () => {
                        this.fetchFinishOnShelf();
                    }
                });
            }
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    // 完成订单
    fetchFinishOnShelf = async () => {
        await PickListApi.pickingDone(this.state.id!);
        message.success(`拣货单：${this.createPickPath.pickList.pickListNumber}已完成拣货`);
        await this.props.onOk();
        this.props.navigate(-1);
    }

    // 根据推荐路径完成拣货
    finishPickedForRecommend = async () => {
        this.setState({ loading: true });
        try {
            await PickListApi.batchPick({
                items: this.state.pickPaths.map(item => ({
                    "outboundOrderId": item.orderId,
                    "locationCode": item.locationCode,
                    "sku": item.sku,
                    "quantity": item.needPickQuantity
                }))
            });
            await this.fetchFinishOnShelf();
        }
        catch {
            this.state.pickPaths = this.createPickPath.createPickPaths();
            this.setState({});
        }
        this.setState({ loading: false });
    }

    render() {
        if (!this.state.init) {
            return <></>
        }

        return <div>
            <div className='flex gap-4'>
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}><Space><span>拣货操作</span><PickHelp /></Space></Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>填写如下信息，然后点击拣货按钮</Typography.Paragraph>
                    <div className='flex flex-wrap'>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>拣货库位</div>
                            <div>
                                <LocationInput
                                    iref={r => this.input1Ref = r}
                                    style={{ width: 250 }}
                                    placeholder='拣货库位'
                                    value={this.state.pick.locationCode}
                                    onChange={(val) => {
                                        this.state.pick.locationCode = val;
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
                                    value={this.state.pick.sku}
                                    onChange={(val) => {
                                        this.state.pick.sku = val;
                                        this.setState({});
                                    }}
                                    onSelect={val => {
                                        this.state.pick.sku = val;
                                        this.setState({});
                                        this.input3Ref?.focus();
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
                            <div className='mb-2'>拣货数量</div>
                            <div>
                                <InputNumber
                                    ref={r => this.input3Ref = r}
                                    style={{ width: 250 }}
                                    placeholder='拣货数量'
                                    value={this.state.pick.quantity}
                                    min={0}
                                    max={999999}
                                    onChange={(val) => {
                                        this.state.pick.quantity = val;
                                        this.setState({});
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.code == 'Enter') {
                                            this.fetchPick();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>拣货订单</div>
                            <div>
                                <Select
                                    placeholder='请选择要拣的订单'
                                    style={{ width: 220 }}
                                    value={this.state.pick.orderId}
                                    onChange={val => {
                                        this.state.pick.orderId = val;
                                        this.setState({});
                                    }}
                                >
                                    {
                                        this.createPickPath.outboundOrders.map(order => (
                                            <Select.Option value={order.id}>{order.index}号单-{order.outboundNumber}</Select.Option>
                                        ))
                                    }
                                </Select>
                            </div>
                        </div>
                    </div>
                    <Typography.Paragraph type='warning'>请你确认拣货信息，没什么问题的话，点击拣货按钮进行拣货</Typography.Paragraph>
                    <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8 }}>
                        <Button loading={this.state.loading} type='primary' onClick={this.fetchPick}>拣货</Button>
                        <Typography.Text type='success'>我们推荐你根据下面的路径去拣货</Typography.Text>
                        <div style={{ flexGrow: 1 }} />
                        <Button loading={this.state.loading} onClick={() => {
                            Modal.confirm({
                                title: `强制完成拣货!`,
                                content: '强制完成拣货吗？该操作不可撤销',
                                onOk: () => {
                                    this.fetchFinishOnShelf();
                                }
                            });
                        }}>强制完成拣货</Button>
                    </div>
                </div>
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}>要拣货的产品信息</Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>如下显示当前要拣货的产品的信息</Typography.Paragraph>
                    <Descriptions bordered layout="vertical">
                        <Descriptions.Item label="SKU">{ProductInfoHelper.skuToProducts[this.state.pick.sku]?.sku || '--'}</Descriptions.Item>
                        <Descriptions.Item label="产品名">{ProductInfoHelper.skuToProducts[this.state.pick.sku]?.name || '--'}</Descriptions.Item>
                        <Descriptions.Item label="计量单位">{ProductInfoHelper.skuToProducts[this.state.pick.sku]?.unit || '--'}</Descriptions.Item>
                        <Descriptions.Item label="体积">{ProductInfoHelper.skuToProducts[this.state.pick.sku]?.volume} {ProductInfoHelper.skuToProducts[this.state.pick.sku]?.volumeUnit}</Descriptions.Item>
                        <Descriptions.Item label="重量">{ProductInfoHelper.skuToProducts[this.state.pick.sku]?.weight} {ProductInfoHelper.skuToProducts[this.state.pick.sku]?.weightUnit}</Descriptions.Item>
                        <Descriptions.Item label="规格">{ProductInfoHelper.skuToProducts[this.state.pick.sku]?.specification || '--'}</Descriptions.Item>
                    </Descriptions>
                </div>
            </div>
            <div className='bg-white p-4 rounded shadow mt-4'>
                <PickPath
                    algorithmType={this.state.algorithmType}
                    onAlgorithmChange={(type) => {
                        Storage.setItem(this.pickPathStorageName, type);
                        let pickPaths = this.createPickPath.createPickPaths(type as AlgorithmType);
                        this.setState({ pickPaths: pickPaths, algorithmType: type });
                    }}
                    rebuildPickPaths={async () => {
                        await this.createPickPath.init(this.state.id!);
                        let pickPaths = this.createPickPath.createPickPaths(this.state.algorithmType as AlgorithmType);
                        this.setState({ pickPaths: pickPaths });
                    }}
                    pickPaths={this.state.pickPaths}
                    onClick={path => {
                        this.setState({
                            pick: {
                                sku: path.sku,
                                quantity: path.needPickQuantity,
                                locationCode: path.locationCode,
                                orderId: path.orderId
                            }
                        });
                    }}
                />
            </div>
            <div className='bg-white p-4 rounded shadow mt-4'>
                <Typography.Title level={5}>基本信息</Typography.Title>
                <Typography.Paragraph className='text-gray-400'>如下显示拣货单的信息</Typography.Paragraph>
                <Descriptions bordered layout="vertical">
                    <Descriptions.Item label="拣货单号">{this.createPickPath.pickList.pickListNumber}</Descriptions.Item>
                    <Descriptions.Item label="订单数量">{this.createPickPath.pickList.orderCount}</Descriptions.Item>
                </Descriptions>
                <Typography.Title className='mt-4' level={5}>拣货明细</Typography.Title>
                <Typography.Paragraph className='text-gray-400'>各个订单的拣货明细</Typography.Paragraph>
                {
                    this.createPickPath.outboundOrders.map(order => {
                        return <Table
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
                                title: 'Sku',
                                key: 'sku',
                                dataIndex: 'sku',
                                render: (val, row) => {
                                    return <a href='javascript:void(0)' onClick={() => {
                                        this.setState({
                                            pick: {
                                                sku: row.sku,
                                                quantity: (row.quantity - row.sortedQuantity),
                                                locationCode: row.locationCode,
                                                orderId: row.orderId
                                            }
                                        });
                                    }}>{val}</a>
                                }
                            }, {
                                title: '名称',
                                key: 'name',
                                dataIndex: 'name',
                                render: (val, row) => {
                                    return ProductInfoHelper.skuToProducts[row.sku]?.name;
                                }
                            }, {
                                title: '计量单位',
                                key: 'unit',
                                dataIndex: 'unit',
                                render: (val, row) => {
                                    return ProductInfoHelper.skuToProducts[row.sku]?.unit;
                                }
                            }, {
                                title: '需拣货数量',
                                key: 'quantity',
                                dataIndex: 'quantity',
                            }, {
                                title: '已拣货数量',
                                key: 'sortedQuantity',
                                dataIndex: 'sortedQuantity',
                                render: (val, row) => {
                                    return val;
                                }
                            }]}
                            dataSource={order.outboundDetails}
                            pagination={false}
                        />
                    })
                }
            </div>
        </div>
    }
}

export default () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const onOk = async () => {
        await dispatch(pickListSlice.asyncActions.refreshPageDatas({}) as any);
    }

    return <Page navigate={navigate} onOk={onOk} />
};