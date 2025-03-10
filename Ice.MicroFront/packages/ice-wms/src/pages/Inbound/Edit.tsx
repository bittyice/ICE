import React from 'react';
import { Typography, Card, Cascader, Row, Col, Select, DatePicker, InputNumber, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool } from 'ice-common';
import { consts, InboundOrderApi, InboundOrderEntity, WarehouseEntity, IceStateType, ProductInfoHelper, LabelValues, enums } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput, Help, ExtraInfo, ProductInfoModal, ProductSelect, ActionList } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

let { Title } = Typography;

type Props = {
    entity?: InboundOrderEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
};

class PageModal extends React.Component<{
    title: string,
    onSubmit: (entity: any) => Promise<void>,
    warehouse: WarehouseEntity,
} & Props> {
    state = {
        loading: false,
        entity: {
            type: enums.InboundOrderType.Customize,
            inboundDetails: []
        } as InboundOrderEntity,
        productInfoShow: false,
    }

    componentDidMount() {
        if (this.props.warehouse.enableInboundBatch == true && !this.props.entity?.id) {
            this.createInboundBatch();
        }
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return InboundOrderApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
            ProductInfoHelper.fetchProducts(e.inboundDetails!.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        }).catch((ex) => {
        });
    }

    checkForm = () => {
        if (this.state.entity.inboundDetails!.length == 0) {
            message.error('请添加明细');
            return false;
        }

        let exitSkus: Array<{ sku: string, index: number }> = [];
        for (let n = 0; n < this.state.entity.inboundDetails!.length; n++) {
            let inboundDetail = this.state.entity.inboundDetails![n];
            if (!inboundDetail.sku) {
                message.error('请输入SKU');
                return false;
            }

            if (!ProductInfoHelper.skuToProducts[inboundDetail.sku]) {
                message.error(`无效的SKU: ${inboundDetail.sku} (第 ${n + 1} 行)`);
                return false;
            }

            let exitSku = exitSkus.find(e => e.sku == inboundDetail.sku);
            if (exitSku) {
                message.error(`第${exitSku.index + 1}与第${n + 1}行的SKU重复，请确保SKU在订单中是唯一的`);
                return false;
            }
            else {
                exitSkus.push({
                    sku: inboundDetail.sku,
                    index: n
                });
            }

            if (!inboundDetail.forecastQuantity) {
                message.error('请输入预报数量');
                return false;
            }
        }

        return true;
    }

    // 从产品添加明细
    addDetailFromProduct = (details: Array<any>) => {
        let inboundDetails = [...this.state.entity.inboundDetails!];
        details.forEach(item => {
            let oldInboundDetail = inboundDetails.find((e: any) => e.sku == item.sku);
            if (oldInboundDetail) {
                oldInboundDetail.sku = item.sku;
            }
            else {
                inboundDetails.push({
                    sku: item.sku,
                    forecastQuantity: 0,
                });
            }
        });
        this.state.entity.inboundDetails = inboundDetails;
        ProductInfoHelper.fetchProducts(this.state.entity.inboundDetails.map((e: any) => e.sku)).then(() => {
            this.setState({});
        });
        this.setState({
            productInfoShow: false
        });
    }

    // 自动生成入库批次号
    createInboundBatch = () => {
        let timestr = Tool.dateFormat(new Date(), 'yyMMdd');
        this.state.entity.inboundBatch = timestr!;
        this.setState({});
    }

    render() {
        return <Modal
            title={this.props.title}
            open={this.props.open}
            confirmLoading={this.state.loading}
            maskClosable={false}
            width={1000}
            onCancel={this.props.onCancel}
            onOk={() => {
                if (!this.checkForm()) {
                    return;
                }

                // 对保质期进行处理
                for (let n = 0; n < this.state.entity.inboundDetails!.length; n++) {
                    let inboundDetail = this.state.entity.inboundDetails![n];
                    if (inboundDetail.shelfLise) {
                        inboundDetail.shelfLise = Tool.dateFormat(inboundDetail.shelfLise, 'yyyy-MM-ddT00:00:00.000Z')!;
                    }
                }

                this.setState({ loading: true });
                return this.props.onSubmit(this.state.entity).then(() => {
                    this.setState({ loading: false });
                });
            }}
        >
            <div>
                <CardEX title='基本信息' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX isMust text={'入库单号'} style={{ width: '33%' }}>
                        {this.props.entity?.id ? this.state.entity.inboundNumber : '提交后生成'}
                    </LabelEX>
                    <LabelEX text={'入库批次号'} style={{ width: '33%' }}>
                        <Input
                            placeholder='入库批次号'
                            addonAfter={<Button size='small' type='text' onClick={this.createInboundBatch}>自动生成</Button>}
                            value={this.state.entity.inboundBatch}
                            maxLength={consts.MinTextLength}
                            onChange={(e) => {
                                this.state.entity.inboundBatch = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'入库类型'} style={{ width: '33%' }}>
                        <Select
                            disabled
                            style={{ width: '100%' }}
                            value={this.state.entity.type}
                            onChange={val => {
                                this.state.entity.type = val;
                                this.setState({})
                            }}
                        >
                            {
                                LabelValues.InboundOrderType.map(item => (
                                    <Select.Option disabled={item.value == enums.InboundOrderType.Transfer} value={item.value}>{item.label}</Select.Option>
                                ))
                            }
                        </Select>
                    </LabelEX>
                </CardEX>
                <CardEX title='入库明细'>
                    <ActionList>
                        <div>
                            <span className='pl-4 pr-1'>快速添加</span>
                            <ProductSelect
                                style={{ width: 120 }}
                                onSelect={product => {
                                    if (product) {
                                        this.addDetailFromProduct([product])
                                    }
                                }}
                            />
                        </div>
                        <Button type='link' disabled={this.state.entity.type != enums.InboundOrderType.Customize} onClick={() => {
                            this.setState({
                                productInfoShow: true
                            });
                        }}>从列表添加明细</Button>
                    </ActionList>
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
                                return ProductInfoHelper.skuToProducts[row.sku!]?.name;
                            }
                        }, {
                            title: '计量单位',
                            key: 'unit',
                            dataIndex: 'unit',
                            width: 100,
                            render: (val, row) => {
                                return ProductInfoHelper.skuToProducts[row.sku!]?.unit;
                            }
                        }, {
                            title: '预报数量',
                            key: 'forecastQuantity',
                            dataIndex: 'forecastQuantity',
                            width: 100,
                            render: (val, row) => {
                                return <InputNumber
                                    key={row.sku}
                                    placeholder='预报数量'
                                    size='small'
                                    disabled={this.state.entity.type != enums.InboundOrderType.Customize}
                                    min={0}
                                    max={999999}
                                    defaultValue={row.forecastQuantity}
                                    onChange={val => {
                                        row.forecastQuantity = val!;
                                        this.setState({});
                                    }}
                                />
                            }
                        }, {
                            title: '保质期',
                            key: 'shelfLise',
                            dataIndex: 'shelfLise',
                            width: 150,
                            render: (val, row) => {
                                return <DatePicker
                                    key={row.sku}
                                    size='small'
                                    defaultValue={row.shelfLise ? dayjs(row.shelfLise) : undefined}
                                    onChange={(val) => {
                                        row.shelfLise = val?.toDate().toISOString();
                                        this.setState({});
                                    }}
                                />
                            }
                        }, {
                            title: '备注',
                            key: 'remark',
                            dataIndex: 'remark',
                            render: (val, row) => {
                                return <Input
                                    key={row.sku}
                                    placeholder='备注'
                                    size='small'
                                    maxLength={consts.MinTextLength}
                                    showCount
                                    defaultValue={row.remark}
                                    onChange={e => {
                                        row.remark = e.currentTarget.value;
                                        this.setState({});
                                    }}
                                />
                            }
                        },
                        {
                            title: '操作',
                            key: 'action',
                            width: 50,
                            fixed: 'right',
                            render: (val, row, index) => {
                                return <Button size='small' danger type='primary' icon={<DeleteOutlined />}
                                    disabled={this.state.entity.type != enums.InboundOrderType.Customize}
                                    onClick={() => {
                                        let details = [...this.state.entity.inboundDetails!];
                                        details.splice(index, 1);
                                        this.state.entity.inboundDetails = details;
                                        this.setState({});
                                    }}
                                ></Button>
                            }
                        }
                        ]}
                        dataSource={this.state.entity.inboundDetails}
                        pagination={false}
                    />
                </CardEX>
                <CardEX title='扩展信息'>
                    <ExtraInfo
                        itemWidth={310}
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
                            value={this.state.entity.remark}
                            onChange={e => {
                                this.state.entity.remark = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                </CardEX>
                <ProductInfoModal
                    open={this.state.productInfoShow}
                    onCancel={() => {
                        this.setState({
                            productInfoShow: false
                        });
                    }}
                    onOk={this.addDetailFromProduct}
                />
            </div>
        </Modal>
    }
}

export const Edit = OpenNewKey((props: Props) => {
    const warehouse = useSelector((state: IceStateType) => state.global.warehouse);

    const onSubmit = async (entity: InboundOrderEntity) => {
        await InboundOrderApi.update(entity);
        props.onOk();
    }

    return <PageModal
        {...props}
        title={`编辑 - ${props.entity?.inboundNumber}`}
        onSubmit={onSubmit}
        warehouse={warehouse}
    />
})

export const Add = OpenNewKey((props: Props) => {
    const warehouse = useSelector((state: IceStateType) => state.global.warehouse);

    const onSubmit = async (entity: InboundOrderEntity) => {
        await InboundOrderApi.create(entity);
        props.onOk();
    }

    return <PageModal
        {...props}
        title='添加'
        onSubmit={onSubmit}
        warehouse={warehouse}
    />
})