import React, { useEffect, useState } from 'react';
import { Space, Button, Input, TreeSelect, Tag, Divider, Modal, DatePicker, Switch, Toast } from 'antd-mobile';
import { PrinterOutlined, NumberOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ArrowRightOutlined } from '@ant-design/icons';
import {
    TextFilter,
    TimeFilter,
    CommonPage,
    CommonPageRefType,
    CommonPageProps,
    MenuProvider,
    OpenNewKey,
    LabelEX,
    SelectFilter
} from 'ice-mobile-layout';
import { PurchaseReturnOrderApi, PurchaseReturnOrderEntity, purchaseReturnOrderSlice, supplierSlice, IceStateType, LabelValues, enums } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router'
import { Tool } from 'ice-common';
import FastHandle from './FastHandle';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

type Props = {
    suppliers: Array<any>,
}

class PurchaseReturnOrder extends React.Component<Props> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<PurchaseReturnOrderEntity>,
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
        // 显示快速处理
        showFastHandle: false,
    }

    classStatus = [
        { label: '全部', value: '' },
        ...LabelValues.OMSPurchaseReturnOrderStatus.map(item => ({
            label: item.label as string,
            value: `${item.value}`,
        }))
    ];

    tableName = `O-PurchaseReturnOrder`;

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '退货单号',
        dataIndex: 'orderNumber',
        // render: (val, row) => {
        //     return <a href="javascript:void(0)" onClick={() => {
        //         this.setState({ showDetail: true, row: row })
        //     }}>{val}</a>
        // }
    }, {
        title: '总额',
        dataIndex: 'price',
    }, {
        title: '供应商',
        dataIndex: 'supplierId',
        render: (val) => {
            return this.props.suppliers.find(e => e.id == val)?.name;
        }
    }, {
        title: '状态',
        dataIndex: 'status',
        render: (val, row) => {
            let labelValue = LabelValues.OMSPurchaseReturnOrderStatus.find(e => e.value == val);
            return <Tag>{labelValue?.label}</Tag>;
        }
    }, {
        title: '是否结算',
        dataIndex: 'isSettlement',
        render: (val, row) => {
            return val ? <Tag color="#87d068">已结算</Tag> : <Tag>未结算</Tag>;
        }
    }, {
        title: '完成时间',
        dataIndex: 'finishDate',
        render: (val) => {
            return Tool.dateFormat(val) || '--';
        }
    }, {
        title: '创建时间',
        dataIndex: 'creationTime',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }, {
        title: '操作',
        render: (val, row) => {
            return <Space>
                {
                    row.status == enums.OMSPurchaseReturnOrderStatus.PendingReview &&
                    <Button size='small'
                        onClick={() => {
                            this.setState({ showFastHandle: true, row: row });
                        }}
                    >快速处理</Button>
                }
                {
                    (
                        row.status == enums.OMSPurchaseReturnOrderStatus.PendingReview
                        || row.status == enums.OMSPurchaseReturnOrderStatus.Returning
                    ) &&
                    <Button size='small' color='danger'
                        onClick={() => {
                            this.fetchInvalid(row);
                        }}
                    >作废</Button>
                }
            </Space>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '退货单号',
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
                label: item.name,
                value: item.id
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

    // 作废
    fetchInvalid = (row: any) => {
        Modal.confirm({
            title: `作废`,
            content: `确认作废吗？${row.orderNumber}`,
            onConfirm: async () => {
                await PurchaseReturnOrderApi.invalid(row.id);
                Toast.show('作废成功');
                this.pageRef?.refresh();
            }
        });
    }

    // 通过审核
    fetchToReturning = (row: any) => {
        Modal.confirm({
            title: `通过审核 - ${row.orderNumber}`,
            content: '确认通过审核吗？',
            onConfirm: async () => {
                await PurchaseReturnOrderApi.toReturning(row.id);
                Toast.show('审核成功');
                this.pageRef?.refresh();
            }
        });
    }

    // 完成
    fetchToFinish = (row: any) => {
        Modal.confirm({
            title: `完成订单 - ${row.orderNumber}`,
            content: '确认完成订单吗？',
            onConfirm: async () => {
                await PurchaseReturnOrderApi.toFinish(row.id);
                Toast.show('成功');
                this.pageRef?.refresh();
            }
        });
    }

    // 请求结算
    fetchSettlement = (row: any) => {
        Modal.confirm({
            title: `完成结算 - ${row.orderNumber}`,
            content: '确认完成结算吗？完成后订单将变成已结算状态',
            onConfirm: async () => {
                await PurchaseReturnOrderApi.settlement(row.id);
                Toast.show('成功');
                this.pageRef?.refresh();
            }
        });
    }

    render() {
        return <>
            <CommonPage
                hasExtraInfo
                slice={purchaseReturnOrderSlice}
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
                    x: 1400
                }}
                classConfig={{
                    classes: this.classStatus,
                    queryName: 'status',
                    defaultValue: enums.OMSPurchaseReturnOrderStatus.PendingReview.toString()
                }}
            ></CommonPage>
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
        </>
    }
}

export default () => {
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];
    const dispatch = useDispatch();
    const fetchSuppliers = async () => {
        dispatch(supplierSlice.asyncActions.fetchAllDatas({}) as any);
    }

    useEffect(() => {
        fetchSuppliers();
    }, []);

    return <PurchaseReturnOrder
        suppliers={suppliers}
    />
};
