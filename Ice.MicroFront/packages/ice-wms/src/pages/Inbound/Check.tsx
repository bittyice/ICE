import React from 'react';
import { Typography, Card, Cascader, Row, Col, Select, DatePicker, InputNumber, Table, Button, Space, Input, Modal, message, Switch, Descriptions } from 'antd';
import { Tool } from 'ice-common';
import { consts, InboundOrderApi, InboundOrderEntity, inboundOrderSlice, WarehouseEntity, IceStateType, ProductInfoHelper, LabelValues, enums } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput, Help, ExtraInfo, ProductInfoModal } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import SkuInput from '../../components/SkuInput';
import { useNavigate } from 'react-router';

let { Title } = Typography;

const CheckHelp = () => {
    const HelpContent = <div>
        <Typography.Paragraph style={{ marginTop: 10 }}>1. 输入查验SKU，点击"查找"（或者按回车）</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>2. 检查SKU的信息是否正确，如不正确，请修改信息</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>3. 点击"修改并通过查验"完成该SKU的查验</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>4. 当订单的所有预报数量等于查验数量时，将提示是否完成查验操作，点击确认后将完成查验，订单状态变更为"待上架"</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>5. 点击"强制完成查验"按钮可强制完成查验，订单状态变更为"待上架"</Typography.Paragraph>
    </div>

    return <Help title='查验操作说明' body={HelpContent} />
}

type Props = {
    navigate: (url: any) => void;
    onOk: () => Promise<void>,
};

class Page extends React.Component<Props> {
    input1Ref: any;

    state = {
        id: Tool.getUrlVariable(window.location.search, 'id'),
        loading: false,
        entity: {
            inboundNumber: '',
            inboundBatch: '',
            type: enums.InboundOrderType.Purchase,
            inboundDetails: []
        } as InboundOrderEntity,
        // 查验Sku
        checkSku: '',
        // 查验明细
        checkDetail: {
            sku: '',
            forecastQuantity: 0,
            actualQuantity: 0 as (number | null),
            shelfLise: undefined as string | undefined,
            remark: null
        }
    }

    componentDidMount() {
        this.fetchEntity();
        this.input1Ref?.focus();
    }

    fetchEntity = async () => {
        let e = await InboundOrderApi.get(this.state.id!);
        this.setState({ entity: e });
        ProductInfoHelper.fetchProducts(e.inboundDetails!.map((e: any) => e.sku)).then(() => {
            this.setState({});
        });
        return e;
    }

    findOrderDetail = () => {
        let inboundDetail = this.state.entity.inboundDetails!.find((e: any) => e.sku == this.state.checkSku);
        if (!inboundDetail) {
            message.error('入库单不存在该SKU，请检查输入的SKU是否正确');
            return;
        }

        this.setState({
            checkDetail: {
                ...inboundDetail,
                actualQuantity: inboundDetail.forecastQuantity
            }
        });
        message.success('请检查各项明细是否正确');
    }

    fetchCheck = async () => {
        if (!this.state.checkDetail.sku) {
            message.error('请先查找SKU');
            return false;
        }

        if (!this.state.checkDetail.actualQuantity) {
            message.error('请输入实际数量');
            return false;
        }

        let shelfLise;
        if (this.state.checkDetail.shelfLise) {
            shelfLise = Tool.dateFormat(this.state.checkDetail.shelfLise, 'yyyy-MM-ddT00:00:00.000Z')
        }

        this.setState({ loading: true });
        try {
            await InboundOrderApi.check({
                id: this.state.id!,
                sku: this.state.checkDetail.sku,
                forecastQuantity: this.state.checkDetail.forecastQuantity,
                actualQuantity: this.state.checkDetail.actualQuantity,
                remark: this.state.checkDetail.remark,
                shelfLise
            });
            message.success(`SKU: ${this.state.checkDetail.sku}查验成功`);
            this.setState({
                // 查验Sku
                checkSku: '',
                // 查验明细
                checkDetail: {
                    sku: '',
                    name: '',
                    forecastQuantity: 0,
                    actualQuantity: 0,
                    shelfLise: null,
                    remark: null
                }
            });

            var val = await this.fetchEntity();

            let inboundDetails = val.inboundDetails!;

            // 检查是否有实际数量小于预报数量
            for (let inboundDetail of inboundDetails) {
                if (inboundDetail.actualQuantity! < inboundDetail.forecastQuantity!) {
                    this.setState({ loading: false });
                    return;
                }
            }

            Modal.confirm({
                title: `完成查验 - ${this.state.entity.inboundNumber}`,
                content: '订单已全部查验，是否完成查验？',
                onOk: () => {
                    this.fetchToOnShelf();
                }
            });
        }
        catch { }
        this.setState({ loading: false });
    }

    fetchToOnShelf = async () => {
        this.setState({ loading: true });
        try {
            await InboundOrderApi.toOnShelf(this.state.id!);
            message.success(`订单${this.state.entity.inboundNumber}已完成查验`);
            await this.props.onOk();
            this.props.navigate(-1);
        }
        catch { }
        this.setState({ loading: false });
    }

    render() {
        return <div>
            <div className='flex gap-4'>
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}>查验操作</Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>填写如下信息，然后点击查验按钮</Typography.Paragraph>
                    <div className='flex flex-wrap'>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>SKU</div>
                            <div>
                                <SkuInput
                                    iref={r => this.input1Ref = r}
                                    style={{ width: 250 }}
                                    value={this.state.checkSku}
                                    onChange={(val) => {
                                        this.state.checkSku = val;
                                        this.setState({});
                                    }}
                                    onSelect={val => {
                                        this.state.checkSku = val;
                                        this.setState({});
                                        this.findOrderDetail();
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.code == 'Enter') {
                                            this.findOrderDetail();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>预报数量</div>
                            <div>
                                <InputNumber
                                    style={{ width: 250 }}
                                    placeholder='预报数量'
                                    max={999999}
                                    min={0}
                                    disabled
                                    value={this.state.checkDetail.forecastQuantity}
                                />
                            </div>
                        </div>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>实际数量</div>
                            <div>
                                <InputNumber
                                    style={{ width: 250 }}
                                    placeholder='实际数量'
                                    max={999999}
                                    min={0}
                                    value={this.state.checkDetail.actualQuantity}
                                    onChange={(val) => {
                                        this.state.checkDetail.actualQuantity = val;
                                        this.setState({});
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>保质期</div>
                            <div>
                                <DatePicker
                                    style={{ width: 250 }}
                                    value={this.state.checkDetail.shelfLise ? dayjs(this.state.checkDetail.shelfLise) : null}
                                    onChange={(val) => {
                                        this.state.checkDetail.shelfLise = val?.toDate().toISOString();
                                        this.setState({});
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-full mb-4'>
                            <div className='mb-2'>备注</div>
                            <div>
                                <span style={{ color: 'red' }}>{this.state.checkDetail.remark || '--'}</span>
                            </div>
                        </div>
                    </div>
                    <Typography.Paragraph type='warning'>请确认信息是否正确，没什么问题的话，点击如下按钮通过查验：</Typography.Paragraph>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <Button loading={this.state.loading} type='primary' onClick={this.fetchCheck}>修改并通过查验</Button>
                        <Button loading={this.state.loading} onClick={() => {
                            Modal.confirm({
                                title: `强制完成查验 - ${this.state.entity.inboundNumber}`,
                                content: '确定强制完成查验吗？该操作不可撤销',
                                onOk: () => {
                                    this.fetchToOnShelf();
                                }
                            });
                        }}>强制完成查验</Button>
                    </div>
                </div>
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}>查验的产品信息</Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>如下显示当前要查验的产品的信息</Typography.Paragraph>
                    <Descriptions bordered layout="vertical">
                        <Descriptions.Item label="SKU">{ProductInfoHelper.skuToProducts[this.state.checkDetail.sku]?.sku || '--'}</Descriptions.Item>
                        <Descriptions.Item label="产品名">{ProductInfoHelper.skuToProducts[this.state.checkDetail.sku]?.name || '--'}</Descriptions.Item>
                        <Descriptions.Item label="计量单位">{ProductInfoHelper.skuToProducts[this.state.checkDetail.sku]?.unit || '--'}</Descriptions.Item>
                        <Descriptions.Item label="体积">{ProductInfoHelper.skuToProducts[this.state.checkDetail.sku]?.volume} {ProductInfoHelper.skuToProducts[this.state.checkDetail.sku]?.volumeUnit}</Descriptions.Item>
                        <Descriptions.Item label="重量">{ProductInfoHelper.skuToProducts[this.state.checkDetail.sku]?.weight} {ProductInfoHelper.skuToProducts[this.state.checkDetail.sku]?.weightUnit}</Descriptions.Item>
                        <Descriptions.Item label="规格">{ProductInfoHelper.skuToProducts[this.state.checkDetail.sku]?.specification || '--'}</Descriptions.Item>
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
                    className='mt-4'
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
                                this.setState({ checkSku: val }, () => {
                                    this.findOrderDetail()
                                });
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
                        title: '保质期',
                        key: 'shelfLise',
                        dataIndex: 'shelfLise',
                        render: (val, row) => {
                            return Tool.dateFormat(val, 'yyyy-MM-dd');
                        }
                    }, {
                        title: '计量单位',
                        key: 'unit',
                        dataIndex: 'unit',
                        render: (val, row) => {
                            return ProductInfoHelper.skuToProducts[row.sku!]?.unit;
                        }
                    }, {
                        title: '体积',
                        key: 'volume',
                        dataIndex: 'volume',
                        render: (val, row) => {
                            return `${ProductInfoHelper.skuToProducts[row.sku!]?.volume || ''}(${ProductInfoHelper.skuToProducts[row.sku!]?.volumeUnit || '--'})`;
                        }
                    }, {
                        title: '重量',
                        key: 'weight',
                        dataIndex: 'weight',
                        render: (val, row) => {
                            return `${ProductInfoHelper.skuToProducts[row.sku!]?.weight || ''}(${ProductInfoHelper.skuToProducts[row.sku!]?.weightUnit || '--'})`;
                        }
                    }, {
                        title: '备注',
                        key: 'remark',
                        dataIndex: 'remark',
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
    const navigate = useNavigate();
    const onOk = async () => {
        await dispatch(inboundOrderSlice.asyncActions.refreshPageDatas({}) as any);
    }

    return <Page
        navigate={navigate}
        onOk={onOk}
    />
}