import React, { useEffect, useState } from 'react';
import { Typography, InputNumber, Space, Button, Input, TreeSelect, Table, Tag, Pagination, Divider, Modal, notification, message, Switch, Popconfirm } from 'antd';
import { PrinterOutlined, NumberOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ArrowRightOutlined } from '@ant-design/icons';
import {
    TextFilter,
    TimeFilter,
    ChecksFilter,
    NumFilter,
    CommonPage,
    CommonPageRefType,
    CommonPageProps,
    MenuProvider,
    OpenNewKey,
    LabelEX,
    ActionList,
    SelectFilter
} from 'ice-layout';
import { Edit, Add } from './Edit';
import { PurchaseOrderApi, PurchaseOrderEntity, purchaseOrderSlice, supplierSlice, IceStateType, LabelValues, enums, paymentMethodSlice, SupplierEntity, PaymentMethodEntity } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router'
import { Tool } from 'ice-common';
import Detail from './Detail';
import Review from './Review';
import HelpDoc from './HelpDoc';
import FastHandle from './FastHandle';
import SetPricePaid from './SetPricePaid';
import { PurchaseToInbound } from '../../components/PushOrderToWms';
import PaymentMethodModal from '../../components/PaymentMethodModal';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

type Props = {
    suppliers: Array<SupplierEntity>,
    paymentMethods: Array<PaymentMethodEntity>
}

class PurchaseOrder extends React.Component<Props> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<PurchaseOrderEntity>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 显示明细
        showDetail: false,
        // 要查看或编辑的数据
        row: (null as any),
        // 默认过滤的值
        defaultFilters: undefined as any,
        // 显示审核
        showReview: false,
        // 推送订单到仓库
        showPushToWarehouse: false,
        // 显示快速处理
        showFastHandle: false,
        // 显示修改已支付总价
        showSetPricePaid: false,
        showPaymentMethod: false,
    }

    classStatus = [
        { label: '全部', value: '' },
        ...LabelValues.OMSPurchaseOrderStatus.map(item => ({
            label: item.label as string,
            value: `${item.value}`,
        }))
    ];

    tableName = `O-PurchaseOrder`;

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '采购单号',
        key: 'orderNumber',
        dataIndex: 'orderNumber',
        sorter: true,
        width: 180,
        render: (val, row) => {
            return <a href="javascript:void(0)" onClick={() => {
                this.setState({ showDetail: true, row: row })
            }}>{val}</a>
        }
    }, {
        title: '总额',
        key: 'price',
        dataIndex: 'price',
    }, {
        title: '已支付金额',
        key: 'pricePaid',
        dataIndex: 'pricePaid',
        render: (val, row) => {
            return <Space>
                {val}
                <Button size='small' type='text' icon={<EditOutlined />}
                    onClick={() => this.setState({ showSetPricePaid: true, row: row })}
                ></Button>
            </Space>
        }
    }, {
        title: '供应商',
        key: 'supplierId',
        dataIndex: 'supplierId',
        render: (val) => {
            return this.props.suppliers.find(e => e.id == val)?.name;
        }
    }, {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        render: (val, row) => {
            let labelValue = LabelValues.OMSPurchaseOrderStatus.find(e => e.value == val);
            return <div style={{ color: labelValue?.color }}>{labelValue?.label}</div>
        }
    }, {
        title: '是否结算',
        key: 'isSettlement',
        dataIndex: 'isSettlement',
        render: (val, row) => {
            return val ? <div style={{ color: '#87d068' }}>已结算</div> : <div>未结算</div>
        }
    }, {
        title: '支付方式',
        key: 'paymentMethodId',
        dataIndex: 'paymentMethodId',
        render: (val, row) => {
            return this.props.paymentMethods.find(e => e.id === val)?.name || '--';
        }
    }, {
        title: '完成时间',
        key: 'finishDate',
        dataIndex: 'finishDate',
        render: (val) => {
            return Tool.dateFormat(val) || '--';
        }
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
        width: 200,
        fixed: 'right',
        render: (val, row) => {
            return <ActionList length={10}>
                <Button size='small' type='link'
                    disabled={row.status != enums.OMSPurchaseOrderStatus.PendingReview}
                    onClick={() => {
                        this.setState({
                            showEdit: true,
                            row: row
                        });
                    }}
                >编辑</Button>
                {
                    row.status == enums.OMSPurchaseOrderStatus.PendingReview ?
                        <Button size='small' type='link' ghost
                            onClick={() => {
                                this.setState({ showReview: true, row: row });
                            }}
                        >审核</Button>
                        : row.status == enums.OMSPurchaseOrderStatus.Purchasing ?
                            <Button size='small' type='link' ghost
                                onClick={() => {
                                    this.fetchToFinish(row);
                                }}
                            >完成</Button>
                            : row.status == enums.OMSPurchaseOrderStatus.Completed ?
                                <Button size='small' type='link' ghost
                                    disabled={row.isSettlement}
                                    onClick={() => {
                                        this.fetchSettlement(row);
                                    }}
                                >结算</Button>
                                : row.status == enums.OMSPurchaseOrderStatus.Invalid ?
                                    <Button size='small' type='link' ghost disabled>作废</Button>
                                    : <></>
                }
                <Button size='small' type='link' ghost
                    disabled={row.status != enums.OMSPurchaseOrderStatus.PendingReview}
                    onClick={() => {
                        this.setState({ showFastHandle: true, row: row });
                    }}
                >快速处理</Button>
            </ActionList>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '采购单号',
        dataIndex: 'orderNumber',
        show: true,
        filter: TextFilter
    }, {
        title: '供应商',
        dataIndex: 'supplierId',
        show: true,
        filter: (props) => <SelectFilter
            {...props}
            filterValues={this.props.suppliers.map(item => ({
                label: item.name!,
                value: item.id!
            }))}
        />
    }, {
        title: '创建时间',
        dataIndex: 'creationTime',
        filter: TimeFilter
    }, {
        title: '是否结算',
        dataIndex: 'isSettlement',
        filter: (props) => <SelectFilter
            {...props}
            filterValues={[
                { label: '已结算', value: 'true' },
                { label: '未结算', value: 'false' },
            ]}
        />
    }];

    constructor(props: Props) {
        super(props);

        let orderNumber = Tool.getUrlVariable(window.location.search, 'orderNumber');
        if (orderNumber) {
            this.state.defaultFilters = {
                orderNumber: orderNumber
            }
        }
    }

    fetchInvalids = async () => {
        if (this.state.selectRows.length === 0) {
            message.warning('请选择订单');
            return;
        }

        if (this.state.selectRows.some(e =>
            e.status !== enums.OMSPurchaseOrderStatus.PendingReview
            && e.status !== enums.OMSPurchaseOrderStatus.Purchasing)) {
            message.error('只能作废待审核和采购中的订单');
            return;
        }

        for (let item of this.state.selectRows) {
            await await PurchaseOrderApi.invalid(item.id!);
        }

        notification.success({
            message: '作废成功',
            description: `已成功作废 ${this.state.selectRows.length} 条订单`
        });
        this.pageRef?.refresh();
    }

    // 完成
    fetchToFinish = (row: any) => {
        Modal.confirm({
            title: `完成订单 - ${row.orderNumber}`,
            content: '确认完成订单吗？',
            onOk: async () => {
                await PurchaseOrderApi.toFinish(row.id);
                message.success('成功');
                this.pageRef?.refresh();
            }
        });
    }

    // 请求结算
    fetchSettlement = (row: any) => {
        Modal.confirm({
            title: `完成结算 - ${row.orderNumber}`,
            content: '确认完成结算吗？完成后订单将变成已结算状态',
            onOk: async () => {
                await PurchaseOrderApi.settlement(row.id);
                message.success('成功');
                this.pageRef?.refresh();
            }
        });
    }

    fetchSetPaymentMethod = async (paymentMethodId: string | null) => {
        this.setState({ showPaymentMethod: false });
        for (let item of this.state.selectRows) {
            await PurchaseOrderApi.setPaymentMethod({
                id: item.id!,
                paymentMethodId: paymentMethodId
            });
        }
        notification.success({
            message: '设置成功',
            description: '已成功更新支付方式！'
        });
        this.pageRef?.refresh();
    }

    render() {
        return <>
            <CommonPage
                bottomTools={<Space><HelpDoc /></Space>}
                hasExtraInfo
                slice={purchaseOrderSlice}
                ref={r => this.pageRef = r}
                columns={this.columns}
                filterColumns={this.filterColumn}
                rowSelection={{
                    selectedRowKeys: this.state.selectRows.map(e => e.id),
                    selectedRows: this.state.selectRows,
                    onSelectChange: (selectedRowKeys: Array<any>, selectedRows: Array<any>) => {
                        this.setState({ selectRows: selectedRows });
                    }
                }}
                defaultFilters={this.state.defaultFilters}
                scroll={{
                    x: 1600
                }}
                classConfig={{
                    classes: this.classStatus,
                    queryName: 'status',
                    // defaultValue: enums.OMSPurchaseOrderStatus.PendingReview.toString()
                }}
                tools={<ActionList length={10}>
                    <Button type='link' icon={<PlusOutlined />}
                        onClick={() => {
                            this.setState({ showAdd: true });
                        }}
                    >添加</Button>
                    <Button type='link'
                        onClick={() => {
                            if (this.state.selectRows.length === 0) {
                                message.warning('请选择数据');
                                return;
                            }
                            this.setState({ showPaymentMethod: true });
                        }}
                    >设置支付方式</Button>
                    <PurchaseToInbound
                        orders={this.state.selectRows}
                    />
                    <Popconfirm title='作废' onConfirm={this.fetchInvalids}>
                        <Button type='text' danger icon={<DeleteOutlined />}>作废</Button>
                    </Popconfirm>
                </ActionList>}
            ></CommonPage>
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
                            showEdit: false,
                        });
                    }}
                    onOk={() => {
                        this.setState({
                            showEdit: false,
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
                <Review
                    entity={this.state.row}
                    open={this.state.showReview}
                    onCancel={() => {
                        this.setState({
                            showReview: false,
                        });
                    }}
                    onOk={() => {
                        this.setState({
                            showReview: false,
                        });
                        this.pageRef?.refresh();
                    }}
                />
            }
            {
                this.state.row &&
                <FastHandle
                    order={this.state.row}
                    open={this.state.showFastHandle}
                    onCancel={() => {
                        this.setState({ showFastHandle: false });
                    }}
                    onOk={() => {
                        this.setState({ showFastHandle: false });
                        this.pageRef?.refresh();
                    }}
                />
            }
            {
                this.state.row &&
                <SetPricePaid
                    entity={this.state.row}
                    open={this.state.showSetPricePaid}
                    onCancel={() => {
                        this.setState({ showSetPricePaid: false });
                    }}
                    onOk={() => {
                        this.setState({ showSetPricePaid: false });
                        this.pageRef?.refresh();
                    }}
                />
            }
            <PaymentMethodModal
                paymentMethods={this.props.paymentMethods}
                open={this.state.showPaymentMethod}
                onCancel={() => this.setState({ showPaymentMethod: false })}
                onOk={this.fetchSetPaymentMethod}
            />
        </>
    }
}

export default () => {
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];
    const paymentMethods = useSelector((state: IceStateType) => state.paymentMethod.allDatas) || [];
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(supplierSlice.asyncActions.fetchAllDatas({}) as any);
        dispatch(paymentMethodSlice.asyncActions.fetchAllDatas({}) as any);
    }, []);

    return <PurchaseOrder
        suppliers={suppliers}
        paymentMethods={paymentMethods}
    />
};
