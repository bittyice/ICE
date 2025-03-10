import React, { useEffect, useState } from 'react';
import { Space, Button, Input, TreeSelect, Tag, Modal, DatePicker, Toast, Switch } from 'antd-mobile';
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
import { SaleOrderApi, SaleOrderEntity, saleOrderSlice, IceStateType, LabelValues, enums } from 'ice-core';
import { Tool } from 'ice-common';
import FastHandle from './FastHandle';
import Reject from './Reject';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

type Props = {
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
        showSetPricePaid: false
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
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '销售单号',
        dataIndex: 'orderNumber',
        // render: (val, row) => {
        //     return <a href="javascript:void(0)" onClick={() => {
        //         this.setState({ showDetail: true, row: row })
        //     }}>{val}</a>
        // }
    }, {
        title: '下单时总价',
        dataIndex: 'placeTotalPrice',
    }, {
        title: '应支付总价',
        dataIndex: 'totalPrice',
    }, {
        title: '已支付金额',
        dataIndex: 'totalPricePaid',
    }, {
        title: '状态',
        dataIndex: 'status',
        render: (val, row) => {
            let labelValue = LabelValues.STSaleOrderStatus.find(e => e.value == val);
            return <Tag>{labelValue?.label}</Tag>;
        }
    }, {
        title: '是否结算',
        dataIndex: 'isSettlement',
        render: (val, row) => {
            return val ? <Tag color="#87d068">已结算</Tag> : <Tag>未结算</Tag>;
        }
    }, {
        title: '销售员',
        dataIndex: 'seller'
    }, {
        title: '客户名',
        dataIndex: 'businessName',
        render: (val: any, row) => {
            return row.recvInfo?.businessName || '--';
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
                    row.status == enums.STSaleOrderStatus.WaitConfirm &&
                    <Button size='small'
                        onClick={() => {
                            this.setState({ showFastHandle: true, row: row });
                        }}
                    >快速处理</Button>
                }
                {
                    row.status == enums.STSaleOrderStatus.WaitConfirm &&
                    <Button size='small' color='danger'
                        onClick={() => {
                            this.setState({ showReject: true, row: row });
                        }}
                    >驳回</Button>
                }
            </Space>
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

    // 取消确认
    fetchUnconfirm = async (row: any) => {
        await SaleOrderApi.unconfirm(row.id);
        Toast.show('已成功取消确认');
        this.pageRef?.refresh();
    }

    // 请求处理
    fetchHandle = (row: any) => {
        Modal.confirm({
            title: `处理订单 - ${row.orderNumber}`,
            content: '请确认操作！',
            onConfirm: async () => {
                await SaleOrderApi.processing(row.id);
                Toast.show('处理成功');
                this.pageRef?.refresh();
            }
        });
    }

    // 签收
    fetchCompleted = (row: any) => {
        Modal.confirm({
            title: `签收订单 - ${row.orderNumber}`,
            content: '确认签收吗？',
            onConfirm: async () => {
                await SaleOrderApi.completed(row.id);
                Toast.show('签收成功');
                this.pageRef?.refresh();
            }
        });
    }

    // 结算
    fetchSettlement = (row: any) => {
        Modal.confirm({
            title: `结算订单 - ${row.orderNumber}`,
            content: '是否将订单标志为已结算',
            onConfirm: async () => {
                await SaleOrderApi.settlement(row.id);
                Toast.show('结算成功');
                this.pageRef?.refresh();
            }
        });
    }

    render() {
        return <>
            <CommonPage
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
                    x: 1800
                }}
                classConfig={{
                    classes: this.classStatus,
                    queryName: 'status',
                    defaultValue: enums.STSaleOrderStatus.WaitConfirm
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
        </>
    }
}

export default SaleOrder;