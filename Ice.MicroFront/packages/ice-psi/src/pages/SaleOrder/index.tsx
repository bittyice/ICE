import React, { useEffect, useState } from 'react';
import { Typography, InputNumber, Space, Button, Input, TreeSelect, Table, Tag, Pagination, Divider, Modal, notification, message, Popconfirm } from 'antd';
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
import { SaleOrderApi, SaleOrderEntity, saleOrderSlice, IceStateType, LabelValues, enums, paymentMethodSlice, PaymentMethodEntity, addressBookSlice } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router'
import { Tool } from 'ice-common';
import Detail from './Detail';
import Confirm from './Confirm';
import Reject from './Reject';
import FastHandle from './FastHandle';
import SetPricePaid from './SetPricePaid';
import OrderPrint from './OrderPrint';
import ApplyReturn from './ApplyReturn';
import HelpDoc from './HelpDoc';
import { SaleToOutbound } from '../../components/PushOrderToWms';
import PaymentMethodModal from '../../components/PaymentMethodModal';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

type Props = {
    paymentMethods: Array<PaymentMethodEntity>
}

class SaleOrder extends React.Component<Props> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<SaleOrderEntity>,
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
        // 显示确认框
        showConfirm: false,
        // 显示驳回框
        showReject: false,
        // 显示打印订单模态
        showOrderPrint: false,
        // 显示退货申请
        showApplyReturn: false,
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
        ...LabelValues.STSaleOrderStatus.map(item => ({
            label: item.label as string,
            value: item.value as string,
        }))
    ];

    tableName = `O-SaleOrder`;

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '销售单号',
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
        title: '下单时总价',
        key: 'placeTotalPrice',
        dataIndex: 'placeTotalPrice',
    }, {
        title: '应支付总价',
        key: 'totalPrice',
        dataIndex: 'totalPrice',
    }, {
        title: '已支付金额',
        key: 'totalPricePaid',
        dataIndex: 'totalPricePaid',
        render: (val, row) => {
            return <Space>
                {val}
                <Button size='small' type='text' icon={<EditOutlined />}
                    onClick={() => this.setState({ showSetPricePaid: true, row: row })}
                ></Button>
            </Space>
        }
    }, {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        render: (val, row) => {
            let labelValue = LabelValues.STSaleOrderStatus.find(e => e.value == val);
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
        title: '销售员',
        key: 'seller',
        dataIndex: 'seller'
    }, {
        title: '客户名',
        key: 'businessName',
        dataIndex: 'businessName',
        render: (val: any, row) => {
            return row.recvInfo?.businessName || '--';
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
        width: 300,
        fixed: 'right',
        render: (val, row) => {
            return <ActionList length={4}>
                <Button size='small' type='link' icon={<EditOutlined />}
                    disabled={row.status != enums.STSaleOrderStatus.WaitConfirm}
                    onClick={() => {
                        this.setState({
                            showEdit: true,
                            row: row
                        });
                    }}
                >编辑</Button>
                {
                    row.status == enums.STSaleOrderStatus.WaitConfirm ?
                        <Button size='small' type='link'
                            onClick={() => {
                                this.setState({ showConfirm: true, row: row });
                            }}
                        >确认</Button>
                        : row.status == enums.STSaleOrderStatus.ToBeProcessed ?
                            <Button size='small' type='link' ghost
                                onClick={() => {
                                    this.fetchHandle(row);
                                }}
                            >处理</Button>
                            : row.status == enums.STSaleOrderStatus.Processing ?
                                <Button size='small' type='link'
                                    onClick={() => {
                                        this.fetchCompleted(row);
                                    }}
                                >签收</Button>
                                : row.status == enums.STSaleOrderStatus.Completed ?
                                    <Button size='small' type='link' ghost
                                        disabled={row.isSettlement}
                                        onClick={() => {
                                            this.fetchSettlement(row);
                                        }}
                                    >结算</Button>
                                    : row.status == enums.STSaleOrderStatus.Rejected ?
                                        <Button size='small' type='link' ghost disabled>作废</Button>
                                        : <></>
                }
                <Button size='small' type='link' ghost
                    disabled={row.status !== enums.STSaleOrderStatus.WaitConfirm}
                    onClick={() => {
                        this.setState({ showFastHandle: true, row: row });
                    }}
                >快速处理</Button>
                <Button size='small' type='link'
                    disabled={row.status !== enums.STSaleOrderStatus.Completed}
                    onClick={() => {
                        this.setState({
                            showApplyReturn: true,
                            row: row
                        });
                    }}
                >申请退货</Button>
                {
                    row.status == enums.STSaleOrderStatus.ToBeProcessed &&
                    <Button size='small' type='link' danger
                        onClick={() => {
                            this.fetchUnconfirm(row);
                        }}
                    >取消</Button>
                }
            </ActionList>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '销售单号',
        dataIndex: 'orderNumber',
        show: true,
        filter: TextFilter
    }, {
        title: '销售员',
        dataIndex: 'seller',
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

        if (this.state.selectRows.some(e => e.status !== enums.STSaleOrderStatus.WaitConfirm)) {
            message.error('只能作废待确认的订单');
            return;
        }

        for (let item of this.state.selectRows) {
            await SaleOrderApi.reject({
                id: item.id!,
                rejectReason: undefined
            });
        }

        notification.success({
            message: '作废成功',
            description: `已成功作废 ${this.state.selectRows.length} 条订单`
        });
        this.pageRef?.refresh();
    }

    // 取消确认
    fetchUnconfirm = async (row: any) => {
        await SaleOrderApi.unconfirm(row.id);
        message.success("已成功取消确认");
        this.pageRef?.refresh();
    }

    // 请求处理
    fetchHandle = (row: any) => {
        Modal.confirm({
            title: `处理订单 - ${row.orderNumber}`,
            content: '请确认操作！',
            onOk: async () => {
                await SaleOrderApi.processing(row.id);
                message.success("处理成功");
                this.pageRef?.refresh();
            }
        });
    }

    // 签收
    fetchCompleted = (row: any) => {
        Modal.confirm({
            title: `签收订单 - ${row.orderNumber}`,
            content: '确认签收吗？',
            onOk: async () => {
                await SaleOrderApi.completed(row.id);
                message.success("签收成功");
                this.pageRef?.refresh();
            }
        });
    }

    // 结算
    fetchSettlement = (row: any) => {
        Modal.confirm({
            title: `结算订单 - ${row.orderNumber}`,
            content: '是否将订单标志为已结算',
            onOk: async () => {
                await SaleOrderApi.settlement(row.id);
                message.success("结算成功");
                this.pageRef?.refresh();
            }
        });
    }

    fetchSetPaymentMethod = async (paymentMethodId: string | null) => {
        this.setState({ showPaymentMethod: false });
        for (let item of this.state.selectRows) {
            await SaleOrderApi.setPaymentMethod({
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
                slice={saleOrderSlice}
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
                    x: 2000
                }}
                classConfig={{
                    classes: this.classStatus,
                    queryName: 'status',
                    // defaultValue: enums.STSaleOrderStatus.WaitConfirm
                }}
                tools={<ActionList length={10}>
                    <Button type='link' icon={<PlusOutlined />}
                        onClick={() => {
                            this.setState({ showAdd: true });
                        }}
                    >添加</Button>
                    <OrderPrint
                        paymentMethods={this.props.paymentMethods}
                        orders={this.state.selectRows}
                    />
                    <Button type='link'
                        onClick={() => {
                            if (this.state.selectRows.length === 0) {
                                message.warning('请选择数据');
                                return;
                            }
                            this.setState({ showPaymentMethod: true });
                        }}
                    >设置支付方式</Button>
                    <SaleToOutbound
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
                <Confirm
                    entity={this.state.row}
                    open={this.state.showConfirm}
                    onCancel={() => {
                        this.setState({
                            showConfirm: false,
                        });
                    }}
                    onOk={() => {
                        this.setState({
                            showConfirm: false,
                        });
                        this.pageRef?.refresh();
                    }}
                />
            }
            {
                this.state.row &&
                <Reject
                    entity={this.state.row}
                    open={this.state.showReject}
                    onCancel={() => {
                        this.setState({
                            showReject: false,
                        });
                    }}
                    onOk={() => {
                        this.setState({
                            showReject: false,
                        });
                        this.pageRef?.refresh();
                    }}
                />
            }
            {
                this.state.row &&
                <ApplyReturn
                    entity={this.state.row}
                    open={this.state.showApplyReturn}
                    onCancel={() => {
                        this.setState({
                            showApplyReturn: false,
                        });
                    }}
                    onOk={() => {
                        this.setState({
                            showApplyReturn: false,
                        });
                        this.pageRef?.refresh();
                    }}
                />
            }
            {
                this.state.row &&
                <FastHandle
                    entity={this.state.row}
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
    const paymentMethods = useSelector((state: IceStateType) => state.paymentMethod.allDatas) || [];
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(paymentMethodSlice.asyncActions.fetchAllDatas({}) as any);
        dispatch(addressBookSlice.asyncActions.fetchAllDatas({}) as any);
    }, []);

    return <SaleOrder
        paymentMethods={paymentMethods}
    />
};