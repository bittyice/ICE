import React from 'react';
import { Typography, Card, Cascader, Row, Col, Select, Tag, InputNumber, Table, Button, Space, Input, Modal, message, Switch, Descriptions } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, OutboundOrderApi, OutboundOrderEntity, IceStateType, enums, ProductInfoHelper, ChinaAreaCodeHelper, outboundOrderSlice } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput, Help, ExtraInfo, ProductInfoModal, AddressBookModal } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';

let { Title } = Typography;

const ReviewHelp = () => {
    const HelpContent = <div>
        <Typography.Paragraph>1. 输入要复核的"SKU"，按回车，然后输入"复核数量"</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>2. 在"复核数量"框按回车或者点击"复核"按钮进行复核</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>3. 当所有明细都已复核时，会弹出是否完成复核框，点击是完成复核</Typography.Paragraph>
    </div>

    return <Help title='复核操作说明' body={HelpContent} />
}

type Props = {
    navigate: (url: any) => void,
    onOk: () => Promise<any>
};

class Page extends React.Component<Props> {
    input1Ref: any;
    input2Ref: any;
    input3Ref: any;

    state = {
        id: Tool.getUrlVariable(window.location.search, 'id'),
        loading: false,
        entity: {
            outboundDetails: []
        } as OutboundOrderEntity,
        // 复核数据
        review: {
            sku: '',
            quantity: null as (number | null),
        },
    }

    componentDidMount() {
        this.fetchEntity();
        this.input1Ref?.focus();
    }

    // 请求实体
    fetchEntity = () => {
        if (!this.state.id) {
            return;
        }

        return OutboundOrderApi.get(this.state.id).then((e) => {
            this.setState({ entity: e });
            ProductInfoHelper.fetchProducts(e.outboundDetails!.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        }).catch((ex) => {
        });
    }

    //复核
    review = () => {
        let outboundDetail: any = this.state.entity.outboundDetails!.find((e: any) => e.sku == this.state.review.sku);
        if (!outboundDetail) {
            message.error("该SKU不在出库单中，请确认是否拣错SKU了");
            return;
        }
        outboundDetail.reviewed = false;

        if (outboundDetail.sortedQuantity != this.state.review.quantity) {
            message.error(`订单中SKU的数量为${outboundDetail.sortedQuantity}，这与复查的SKU数量不同`);
            return;
        }

        message.success("复核通过，该SKU没有问题");
        outboundDetail.reviewed = true;
        this.setState({
            review: {
                sku: '',
                quantity: undefined,
            }
        });
        this.input1Ref?.focus();

        // 检查明细项，查看是否还有未复核的明细
        if (this.state.entity.outboundDetails!.some((e: any) => e.reviewed != true)) {
            return;
        }

        Modal.confirm({
            title: `复核完成 - ${this.state.entity.outboundNumber}`,
            content: '订单已全部复核，是否完成复核',
            onOk: () => {
                this.fetchReview();
            }
        });
    }

    // 请求复核
    fetchReview = async () => {
        await OutboundOrderApi.review(this.state.id!);
        message.success('已完成复核');
        await this.props.onOk();
        this.props.navigate(-1);
    }

    render() {
        return <div>
            <div className='flex gap-4'>
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}><Space><span>复核操作</span><ReviewHelp /></Space></Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>填写如下信息，然后点击复核按钮</Typography.Paragraph>
                    <div className='flex flex-wrap'>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>SKU</div>
                            <div>
                                <Input
                                    ref={r => this.input1Ref = r}
                                    style={{ width: 250 }}
                                    placeholder='SKU'
                                    value={this.state.review.sku}
                                    maxLength={consts.MinTextLength}
                                    showCount
                                    onChange={(e) => {
                                        this.state.review.sku = e.currentTarget.value;
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
                            <div className='mb-2'>复核数量</div>
                            <div>
                                <InputNumber
                                    ref={r => this.input2Ref = r}
                                    style={{ width: 250 }}
                                    placeholder='复核数量'
                                    value={this.state.review.quantity}
                                    min={0}
                                    max={999999}
                                    onChange={(val) => {
                                        this.state.review.quantity = val;
                                        this.setState({});
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.code == 'Enter') {
                                            this.review();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <Button type='primary' onClick={this.review}>复核</Button>
                    </div>
                </div>
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}>要复核的产品信息</Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>如下显示当前要复核的产品的信息</Typography.Paragraph>
                    <Descriptions bordered layout="vertical">
                        <Descriptions.Item label="SKU">{ProductInfoHelper.skuToProducts[this.state.review.sku]?.sku || '--'}</Descriptions.Item>
                        <Descriptions.Item label="产品名">{ProductInfoHelper.skuToProducts[this.state.review.sku]?.name || '--'}</Descriptions.Item>
                        <Descriptions.Item label="计量单位">{ProductInfoHelper.skuToProducts[this.state.review.sku]?.unit || '--'}</Descriptions.Item>
                        <Descriptions.Item label="体积">{ProductInfoHelper.skuToProducts[this.state.review.sku]?.volume} {ProductInfoHelper.skuToProducts[this.state.review.sku]?.volumeUnit}</Descriptions.Item>
                        <Descriptions.Item label="重量">{ProductInfoHelper.skuToProducts[this.state.review.sku]?.weight} {ProductInfoHelper.skuToProducts[this.state.review.sku]?.weightUnit}</Descriptions.Item>
                        <Descriptions.Item label="规格">{ProductInfoHelper.skuToProducts[this.state.review.sku]?.specification || '--'}</Descriptions.Item>
                    </Descriptions>
                </div>
            </div>
            <div className='bg-white p-4 rounded shadow mt-4'>
                <Typography.Title level={5}>基本信息</Typography.Title>
                <Typography.Paragraph className='text-gray-400'>如下显示出库单的信息</Typography.Paragraph>
                <Descriptions bordered layout="vertical">
                    <Descriptions.Item label="出库单号">{this.state.entity.outboundNumber}</Descriptions.Item>
                    <Descriptions.Item label="联系人">{this.state.entity.recvContact}</Descriptions.Item>
                    <Descriptions.Item label="联系电话">{this.state.entity.recvContactNumber}</Descriptions.Item>
                    <Descriptions.Item label="省/市/区">{[this.state.entity.recvProvince, this.state.entity.recvCity, this.state.entity.recvTown].filter(e => e).join(' / ')}</Descriptions.Item>
                    <Descriptions.Item label="邮编">{this.state.entity.recvPostcode}</Descriptions.Item>
                    <Descriptions.Item label="详细地址">{this.state.entity.recvAddressDetail}</Descriptions.Item>
                </Descriptions>
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
                        title: 'Sku',
                        key: 'sku',
                        dataIndex: 'sku',
                        render: (val) => {
                            return <a href='javascript:void(0)' onClick={() => {
                                this.state.review.sku = val;
                                this.input2Ref?.focus();
                                this.setState({});
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
                        title: '计量单位',
                        key: 'unit',
                        dataIndex: 'unit',
                        render: (val, row) => {
                            return ProductInfoHelper.skuToProducts[row.sku!]?.unit;
                        }
                    }, {
                        title: '数量',
                        key: 'quantity',
                        dataIndex: 'quantity',
                    }, {
                        title: '分拣数量',
                        key: 'sortedQuantity',
                        dataIndex: 'sortedQuantity',
                        render: (val) => {
                            return <span style={{ color: '#eb2f96' }}>{val}</span>
                        }
                    }, {
                        title: '是否复查',
                        key: 'reviewed',
                        dataIndex: 'reviewed',
                        render: (val) => {
                            return val ? <Tag color='#a0d911'>是</Tag> : <Tag>否</Tag>
                        }
                    }]}
                    dataSource={this.state.entity.outboundDetails}
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
        await dispatch(outboundOrderSlice.asyncActions.refreshPageDatas({}) as any);
    }

    return <Page
        navigate={navigate}
        onOk={onOk}
    />
};