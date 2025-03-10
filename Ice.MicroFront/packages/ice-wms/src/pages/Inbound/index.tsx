import React, { useState, useRef } from 'react';
import { Col, Row, Space, Button, Input, Tabs, Table, Tag, Pagination, Divider, Modal, Typography, message, Switch } from 'antd';
import { SyncOutlined, NumberOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ArrowRightOutlined, PrinterOutlined } from '@ant-design/icons';
import {
    TextFilter,
    TimeFilter,
    ChecksFilter,
    NumFilter,
    CommonPage,
    CommonPageRefType,
    CommonPageProps,
    Barcode,
    PrintDatas,
    MenuProvider,
    OpenNewKey,
    LabelEX,
    ActionList
} from 'ice-layout';
import { Edit, Add } from './Edit';
import { InboundOrderApi, inboundOrderSlice, InboundOrderEntity, IceStateType, LabelValues, enums, WarehouseEntity } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool } from 'ice-common';
import Detail from './Detail';
import OnShelfLocation from './OnShelfLocation';
import { InboundBatchHelp } from '../../components/Helps';
import HelpDoc from './HelpDoc';
import LocationInput from '../../components/LocationInput';

export { default as Check } from './Check';
export { default as OnShelf } from './OnShelf';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

const PrintSKU = (props: { selectInbounds: Array<any> }) => {
    const [printDatasKey, setPrintDatasKey] = useState(0);
    type SkuQuantity = { sku: string, quantity: number };
    let [skus, setSkus] = useState<Array<SkuQuantity>>([]);
    const ref = useRef<PrintDatas>();

    const fetchInbounds = () => {
        return InboundOrderApi.getListWithDetail({
            ids: props.selectInbounds.map(e => e.id)
        }).then((datas) => {
            let skus: Array<SkuQuantity> = [];
            datas.forEach((inbound: any) => {
                inbound.inboundDetails.forEach((detail: any) => {
                    let sku = skus.find(e => e.sku == detail.sku);
                    if (!sku) {
                        skus.push({ sku: detail.sku, quantity: detail.forecastQuantity });
                        return;
                    }

                    sku.quantity = sku.quantity + detail.forecastQuantity;
                });
            });
            setSkus(skus);
        });
    }

    return <>
        <Button icon={<PrinterOutlined />} type='link'
            onClick={() => {
                if (props.selectInbounds.length == 0) {
                    message.warning('请选择入库单');
                    return;
                }

                fetchInbounds().then(() => {
                    setPrintDatasKey(printDatasKey + 1);
                    setTimeout(() => {
                        ref.current?.print();
                    }, 10);
                });
            }}
        >打印SKU</Button>
        <PrintDatas
            key={printDatasKey}
            ref={r => ref.current = r!}
            printDatas={skus.map(item => <Barcode code={item.sku} />)}
        />
    </>
}

const FastOnshlef = OpenNewKey((props: {
    order: any,
    open: boolean,
    onCancel: () => void,
    onOk: () => void
}) => {
    const [locationCode, setLocationCode] = useState<string>('');

    async function onSubmit() {
        if (!locationCode) {
            message.error('请输入库位');
            return;
        }

        await InboundOrderApi.fastOnshlef({
            id: props.order.id!,
            locationCode: locationCode
        });

        message.success('已完成上架');
        props.onOk();
    }

    return <Modal
        title={`快速上架-${props.order.inboundNumber}`}
        open={props.open}
        onCancel={props.onCancel}
        onOk={onSubmit}
        width={350}
    >
        <Typography.Paragraph type='warning'>点击确定后我们会将跳过查验并将订单的产品全都上到该库位上并完成上架</Typography.Paragraph>
        <LabelEX text='上架库位'>
            <LocationInput
                style={{ width: 250 }}
                placeholder='上架库位'
                value={locationCode}
                onChange={(val) => {
                    setLocationCode(val);
                }}
            />
        </LabelEX>
    </Modal>
})

type Props = {
    warehouseId: string,
    warehouse: WarehouseEntity,
    navigate: (url: any) => void,
}

class Inbound extends React.Component<Props> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<InboundOrderEntity>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 显示明细
        showDetail: false,
        // 显示上架库位
        showOnShelfLocation: false,
        // 要查看或编辑的数据
        row: (null as any),
        // 默认过滤的值
        defaultFilters: undefined as any,
        // 显示快速上架
        showFastOnshlef: false,
    }

    classStatus = [
        { label: '全部', value: '' },
        ...LabelValues.InboundOrderStatus.map(item => ({
            label: item.label as string,
            value: item.value.toString() as string,
        }))
    ];

    tableName = `W-Inbound-${this.props.warehouseId}`;

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '入库单号',
        key: 'inboundNumber',
        dataIndex: 'inboundNumber',
        sorter: true,
        width: 180,
        render: (val, row) => {
            return <a href="javascript:void(0)" onClick={() => {
                this.setState({ showDetail: true, row: row })
            }}>{val}</a>
        }
    }, {
        title: '入库批次号',
        key: 'inboundBatch',
        dataIndex: 'inboundBatch',
    }, {
        title: '入库类型',
        key: 'type',
        dataIndex: 'type',
        render: (val, row) => {
            let labelValue = LabelValues.InboundOrderType.find(e => e.value == val);
            return <div style={{ color: labelValue?.color }}>{labelValue?.label}</div>
        }
    }, {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        render: (val, row) => {
            let labelValue = LabelValues.InboundOrderStatus.find(e => e.value == val);
            return <div style={{ color: labelValue?.color }}>{labelValue?.label}</div>
        }
    }, {
        title: '其他信息',
        key: 'otherInfo',
        dataIndex: 'otherInfo'
    }, {
        title: '创建时间',
        key: 'creationTime',
        dataIndex: 'creationTime',
        sorter: true,
        defaultSortOrder: 'descend',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }, {
        title: '操作',
        key: 'action',
        width: 230,
        fixed: 'right',
        render: (val, row) => {
            return <ActionList>
                <Button size='small' type='link' icon={<EditOutlined />}
                    disabled={row.status != enums.InboundOrderStatus.PendingReceipt}
                    onClick={() => {
                        this.setState({
                            showEdit: true,
                            row: row
                        });
                    }}
                >编辑</Button>
                {
                    row.status == enums.InboundOrderStatus.PendingReceipt ?
                        <Button size='small' type='link'
                            onClick={() => {
                                this.fetchReceipt(row);
                            }}
                        >收货</Button>
                        : row.status == enums.InboundOrderStatus.UnderInspection ?
                            <Button size='small' type='link'
                                onClick={() => {
                                    this.props.navigate(MenuProvider.getUrl(['outinbound', `check?id=${row.id}`]));
                                }}
                            >验货</Button>
                            : row.status == enums.InboundOrderStatus.OnTheShelf ?
                                <Button size='small' type='link'
                                    onClick={() => {
                                        this.props.navigate(MenuProvider.getUrl(['outinbound', `on-shelf?id=${row.id}`]));
                                    }}
                                >上架</Button>
                                : row.status == enums.InboundOrderStatus.Shelfed ?
                                    <Button size='small' type='link' disabled>已上架</Button>
                                    : <Button size='small' type='link' disabled>已作废</Button>
                }
                <Button size='small' type='link'
                    disabled={row.status !== enums.InboundOrderStatus.Shelfed}
                    onClick={() => {
                        this.setState({
                            showOnShelfLocation: true,
                            row: row
                        })
                    }}
                >上架信息</Button>
                {
                    row.status == enums.InboundOrderStatus.PendingReceipt &&
                    <Button size='small' type='link'
                        onClick={() => {
                            this.setState({
                                showFastOnshlef: true,
                                row: row
                            });
                        }}
                    >快速处理</Button>
                }
                {
                    row.status == enums.InboundOrderStatus.PendingReceipt &&
                    row.type == enums.InboundOrderType.Customize &&
                    <Button size='small' danger type='link'
                        onClick={() => {
                            this.fetchInvalid(row);
                        }}
                    >作废</Button>
                }
            </ActionList>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '入库单号',
        dataIndex: 'inboundNumber',
        show: true,
        filter: TextFilter
    }, {
        title: '入库批次号',
        dataIndex: 'inboundBatch',
        show: true,
        filter: TextFilter
    }, {
        title: '创建时间',
        dataIndex: 'creationTime',
        show: true,
        filter: TimeFilter
    }];

    constructor(props: Props) {
        super(props);

        let inboundNumber = Tool.getUrlVariable(window.location.search, 'inboundNumber');
        if (inboundNumber) {
            this.state.defaultFilters = {
                inboundNumber: inboundNumber
            }
        }

        let inboundBatch = Tool.getUrlVariable(window.location.search, 'inboundBatch');
        if (inboundBatch) {
            this.state.defaultFilters = {
                inboundBatch: inboundBatch
            }
        }
    }

    // 收货
    fetchReceipt = (row: any) => {
        if (this.props.warehouse.enableInboundBatch == true && !row.inboundBatch) {
            message.error('请先填写入库批次号才能进行收货');
            return;
        }

        Modal.confirm({
            title: `收货 - ${row.inboundNumber}`,
            content: '确认收货吗？',
            onOk: async () => {
                await InboundOrderApi.receipt(row.id);
                message.success('收货成功');
                this.pageRef?.refresh();
            }
        });
    }

    // 作废
    fetchInvalid = (row: any) => {
        Modal.confirm({
            title: `作废 - ${row.inboundNumber}`,
            content: '确认作废吗？',
            onOk: async () => {
                await InboundOrderApi.invalid(row.id);
                message.success('作废成功');
                this.pageRef?.refresh();
            }
        });
    }

    render() {
        return <>
            <CommonPage
                bottomTools={<Space><HelpDoc /></Space>}
                defaultFilters={this.state.defaultFilters}
                ref={r => this.pageRef = r}
                slice={inboundOrderSlice}
                columns={this.columns}
                filterColumns={this.filterColumn}
                rowSelection={{
                    selectedRowKeys: this.state.selectRows.map(e => e.id),
                    selectedRows: this.state.selectRows,
                    onSelectChange: (selectedRowKeys: Array<any>, selectedRows: Array<any>) => {
                        this.setState({ selectRows: selectedRows });
                    }
                }}
                scroll={{
                    x: 1200
                }}
                classConfig={{
                    classes: this.classStatus,
                    queryName: 'status'
                }}
                tools={<ActionList>
                    <Button type='link' icon={<PlusOutlined />}
                        onClick={() => {
                            this.setState({ showAdd: true });
                        }}
                    >添加</Button>
                    <PrintSKU selectInbounds={this.state.selectRows} />
                </ActionList>}
            />
            <Add
                open={this.state.showAdd}
                onCancel={() => {
                    this.setState({
                        showAdd: false
                    });
                }}
                onOk={() => {
                    this.setState({
                        showAdd: false
                    });
                    this.pageRef?.refresh();
                }}
            />
            {
                this.state.row &&
                <Edit
                    entity={this.state.row}
                    open={this.state.showEdit}
                    onCancel={() => {
                        this.setState({
                            showEdit: false
                        });
                    }}
                    onOk={() => {
                        this.setState({
                            showEdit: false
                        });
                        this.pageRef?.refresh();
                    }}
                />
            }
            {
                this.state.row &&
                <Detail
                    entity={this.state.row}
                    open={this.state.showDetail}
                    onCancel={() => {
                        this.setState({
                            showDetail: false,
                        });
                    }}
                />
            }
            {
                this.state.row &&
                <OnShelfLocation
                    inboundOrderId={this.state.row.id}
                    open={this.state.showOnShelfLocation}
                    onCancel={() => {
                        this.setState({
                            showOnShelfLocation: false,
                        });
                    }}
                />
            }
            {
                this.state.row &&
                <FastOnshlef
                    order={this.state.row}
                    key={`fast-onshlef-${this.state.row.id}`}
                    open={this.state.showFastOnshlef}
                    onCancel={() => {
                        this.setState({
                            showFastOnshlef: false,
                        });
                    }}
                    onOk={() => {
                        this.setState({
                            showFastOnshlef: false,
                        });
                        this.pageRef?.refresh();
                    }}
                />
            }
        </>
    }
}

export default () => {
    const dispatch = useDispatch();
    const warehouse = useSelector((state: IceStateType) => state.global.warehouse);
    const navigate = useNavigate();

    return <Inbound
        navigate={navigate}
        warehouse={warehouse}
        warehouseId={warehouse.id!}
    />
}
