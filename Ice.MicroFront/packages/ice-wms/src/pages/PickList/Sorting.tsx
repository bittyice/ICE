import React from 'react';
import { Typography, Radio, Tag, Row, Tabs, Select, DatePicker, InputNumber, Table, Button, Space, Input, Modal, message, Switch, Descriptions } from 'antd';
import { Tool, iceFetch, Storage } from 'ice-common';
import { consts, OutboundOrderApi, OutboundOrderEntity, PickListApi, PickListEntity, IceStateType, enums, ProductInfoHelper, ChinaAreaCodeHelper, LabelValues, PickPathItemType, CreatePickPath, AlgorithmType } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput, Help, ExtraInfo, ProductInfoModal, AddressBookModal } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { NumberOutlined, DeleteOutlined, ArrowDownOutlined } from '@ant-design/icons';
import SkuInput from '../../components/SkuInput';

let { Title } = Typography;

const SortingHelp = () => {
    const HelpContent = <div>
        <Typography.Paragraph style={{ marginTop: 10 }}>1. 输入SKU，按回车键（这时候输入焦点会跑到"分拣数量"输入框）</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>2. 根据系统反馈的信息，将对应的产品数量放入对应的篮子中</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>3. 点击分拣按钮或者在"数量"输入框上按下回车键进行分拣</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>4. 当所有出库单都已分拣完成后会提示是否完成分拣，点击是完成分拣</Typography.Paragraph>
    </div>

    return <Help title='拣货操作说明' body={HelpContent} />
}

type Props = {
    navigate: (url: any) => void
};

class Page extends React.Component<Props> {
    input1Ref: any;
    input2Ref: any;

    state = {
        id: Tool.getUrlVariable(window.location.search, 'id'),
        // 禁用回车，防止误点击
        disabledEnter: false,
        loading: false,
        entity: {
            pickListNumber: ''
        } as any,
        // 关联的出库单
        outboundOrders: [] as Array<OutboundOrderEntity>,
        // 分拣数据
        sorting: {
            sku: '',
            sortingQuantity: 0 as (number | null),
            outboundOrder: null as (string | null),
        },
    }

    componentDidMount() {
        this.fetchEntity();
        this.fetchOutboundOrders();
        this.input1Ref?.focus();
    }

    findSortingOrder = () => {
        // 可以选择的出库单(订单)
        for (let n = 0; n < this.state.outboundOrders.length; n++) {
            let outbountOrder = this.state.outboundOrders[n] as any;
            for (let outboundDetail of (outbountOrder.outboundDetails! as Array<any>)) {
                if (outboundDetail.sku == this.state.sorting.sku) {
                    let quantity = outboundDetail.sortedQuantity - outboundDetail.curSortedQuantity;
                    if (quantity <= 0) {
                        continue;
                    }
                    this.state.sorting.sortingQuantity = quantity;
                    this.state.sorting.outboundOrder = outbountOrder.id!;
                    message.info(`请把SKU为 ${outboundDetail.sku} 的 ${quantity} 个产品放到 ${outbountOrder.index} 号篮中`);
                    this.setState({ disabledEnter: true });
                    setTimeout(() => {
                        this.setState({ disabledEnter: false });
                    }, 2000)
                    this.input2Ref?.focus();
                    return;
                }
            }
        }

        message.error(`无法将 ${this.state.sorting.sku} 放入到任何一个订单中，请确认是否误拣或多拣了某个产品`);
    }

    // 请求实体
    fetchEntity = () => {
        return PickListApi.get(this.state.id!).then((val) => {
            this.setState({ entity: val });
            return val;
        });
    }

    fetchOutboundOrders = () => {
        return OutboundOrderApi.getListWithDetailsForPickId(this.state.id!).then((datas) => {
            datas.sort((l: any, r: any) => (l.outboundNumber > r.outboundNumber ? 1 : 0))

            datas.forEach((item: any, i: number) => {
                item.index = i + 1;
                item.outboundDetails.forEach((detail: any) => {
                    detail.curSortedQuantity = 0;
                });
            });
            this.setState({
                outboundOrders: datas
            });
            return datas;
        }).then((datas) => {
            let skus: Array<string> = [];
            datas.forEach(item => {
                item.outboundDetails!.forEach((detail: any) => {
                    if (!skus.some(e => e == detail.sku)) {
                        skus.push(detail.sku);
                    }
                });
            });
            return ProductInfoHelper.fetchProducts(skus).then(() => {
                this.setState({});
            });
        });
    }

    fetchSorting = () => {
        if (this.state.disabledEnter) {
            message.error('你点击太快了，请确认数量并将产品放入订单中');
            return;
        }

        if (!this.state.sorting.sku) {
            message.error('请输入SKU');
            return;
        }

        if (!this.state.sorting.outboundOrder) {
            message.error('请选择分拣订单');
            return;
        }

        if (!this.state.sorting.sortingQuantity) {
            message.error('请输入分拣数量');
            return;
        }

        let outboundOrderId = this.state.sorting.outboundOrder;
        let outboundOrder = this.state.outboundOrders.find(e => e.id == outboundOrderId);
        if (!outboundOrder) {
            message.error('找不到对应的出库单');
            return;
        }

        let detail = outboundOrder.outboundDetails!.find((detail: any) => detail.sku == this.state.sorting.sku) as any;
        if (!detail) {
            message.error('所选出库单不包含当前要分拣的SKU');
            return;
        }

        if (detail.sortedQuantity < (detail.curSortedQuantity + this.state.sorting.sortingQuantity)) {
            message.error(`当前出库单只需要${detail.sortedQuantity - detail.curSortedQuantity}个该SKU`);
            return;
        }

        detail.curSortedQuantity = detail.curSortedQuantity + this.state.sorting.sortingQuantity;
        message.success('分拣成功');
        this.state.sorting.sku = '';
        this.state.sorting.sortingQuantity = 0;
        this.setState({});
        this.input1Ref?.focus();

        for (let outbountOrder of this.state.outboundOrders) {
            for (let outboundDetail of (outbountOrder.outboundDetails! as Array<any>)) {
                // 如果有某个已分拣数量小于需分拣数量，则返回
                if (outboundDetail.curSortedQuantity < outboundDetail.sortedQuantity) {
                    return;
                }
            }
        }

        Modal.confirm({
            title: `完成分拣 - ${this.state.entity.pickListNumber}`,
            content: '拣货单已全部分拣完成，点击确认可返回上一页？',
            onOk: () => {
                this.props.navigate(-1);
            }
        });
    }

    render() {
        return <div>
            <div className='flex gap-4'>
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}>分拣操作</Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>填写如下信息，然后点击分拣按钮</Typography.Paragraph>
                    <div className='flex flex-wrap'>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>SKU</div>
                            <div>
                                <SkuInput
                                    iref={r => this.input1Ref = r}
                                    value={this.state.sorting.sku}
                                    onChange={(val) => {
                                        this.state.sorting.sku = val;
                                        this.setState({});
                                    }}
                                    onSelect={val => {
                                        this.state.sorting.sku = val;
                                        this.setState({});
                                        this.findSortingOrder();
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.code == 'Enter') {
                                            this.findSortingOrder();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>分拣数量</div>
                            <div>
                                <InputNumber
                                    ref={r => this.input2Ref = r}
                                    style={{ width: 250 }}
                                    placeholder='分拣数量'
                                    disabled={this.state.loading}
                                    value={this.state.sorting.sortingQuantity}
                                    min={0}
                                    max={999999}
                                    onChange={(val) => {
                                        this.state.sorting.sortingQuantity = val;
                                        this.setState({});
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.code == 'Enter') {
                                            this.fetchSorting();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-1/2 mb-4'>
                            <div className='mb-2'>分拣订单</div>
                            <div>
                                <Select
                                    style={{ width: 250 }}
                                    placeholder='分拣订单'
                                    value={this.state.sorting.outboundOrder}
                                    onChange={val => {
                                        this.state.sorting.outboundOrder = val;
                                        this.setState({});
                                    }}
                                >
                                    {
                                        this.state.outboundOrders.map((item: any, index) => (
                                            <Select.Option value={item.id}>{`订单${item.index} : ${item.outboundNumber.substr(-4)}`}</Select.Option>
                                        ))
                                    }
                                </Select>
                            </div>
                        </div>
                    </div>
                    <Typography.Paragraph type='warning'>请你确认分拣信息，没什么问题的话，点击如下按钮进行分拣：</Typography.Paragraph>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <Button loading={this.state.loading} type='primary' onClick={this.fetchSorting}>分拣</Button>
                    </div>
                </div>
                <div className=' bg-white p-4 rounded shadow w-2/4'>
                    <Typography.Title level={5}>要分拣的产品信息</Typography.Title>
                    <Typography.Paragraph className='text-gray-400'>如下显示当前要分拣的产品的信息</Typography.Paragraph>
                    <Descriptions bordered layout="vertical">
                        <Descriptions.Item label="SKU">{ProductInfoHelper.skuToProducts[this.state.sorting.sku]?.sku || '--'}</Descriptions.Item>
                        <Descriptions.Item label="产品名">{ProductInfoHelper.skuToProducts[this.state.sorting.sku]?.name || '--'}</Descriptions.Item>
                        <Descriptions.Item label="计量单位">{ProductInfoHelper.skuToProducts[this.state.sorting.sku]?.unit || '--'}</Descriptions.Item>
                        <Descriptions.Item label="体积">{ProductInfoHelper.skuToProducts[this.state.sorting.sku]?.volume} {ProductInfoHelper.skuToProducts[this.state.sorting.sku]?.volumeUnit}</Descriptions.Item>
                        <Descriptions.Item label="重量">{ProductInfoHelper.skuToProducts[this.state.sorting.sku]?.weight} {ProductInfoHelper.skuToProducts[this.state.sorting.sku]?.weightUnit}</Descriptions.Item>
                        <Descriptions.Item label="规格">{ProductInfoHelper.skuToProducts[this.state.sorting.sku]?.specification || '--'}</Descriptions.Item>
                    </Descriptions>
                </div>
            </div>
            <div className='bg-white p-4 rounded shadow mt-4'>
                <Tabs type='card'>
                    {
                        this.state.outboundOrders.map((outbountOrder, index) => (<Tabs.TabPane tab={`订单${index + 1} : ${outbountOrder.outboundNumber!.substr(-4)}`} key={outbountOrder.outboundNumber}>
                            <Typography.Title level={5}>基本信息</Typography.Title>
                            <Typography.Paragraph className='text-gray-400'>如下显示出库单的信息</Typography.Paragraph>
                            <Descriptions bordered layout="vertical">
                                <Descriptions.Item label="出库单号">{outbountOrder.outboundNumber}</Descriptions.Item>
                                <Descriptions.Item label="联系人">{outbountOrder.recvContact}</Descriptions.Item>
                                <Descriptions.Item label="联系电话">{outbountOrder.recvContactNumber}</Descriptions.Item>
                                <Descriptions.Item label="省/市/区">{[outbountOrder.recvProvince, outbountOrder.recvCity, outbountOrder.recvTown].filter(e => e).join(' / ')}</Descriptions.Item>
                                <Descriptions.Item label="邮编">{outbountOrder.recvPostcode}</Descriptions.Item>
                                <Descriptions.Item label="详细地址">{outbountOrder.recvAddressDetail}</Descriptions.Item>
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
                                        return <a href="javascript:void(0)"
                                            onClick={() => {
                                                this.state.sorting.sku = val;
                                                this.setState({}, this.findSortingOrder);
                                            }}
                                        >{val}</a>
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
                                    title: '拣货数量',
                                    key: 'sortedQuantity',
                                    dataIndex: 'sortedQuantity'
                                }, {
                                    title: '已分拣数量',
                                    key: 'curSortedQuantity',
                                    dataIndex: 'curSortedQuantity',
                                    render: (val) => {
                                        return <span style={{ color: '#eb2f96' }}>{val}</span>
                                    }
                                }]}
                                dataSource={outbountOrder.outboundDetails}
                                pagination={false}
                            />
                        </Tabs.TabPane>))
                    }
                </Tabs>
            </div>
        </div>
    }
}

export default () => {
    const navigate = useNavigate();
    return <Page
        navigate={navigate}
    />
};