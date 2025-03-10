import React, { useEffect, useState } from 'react';
import { Typography, InputNumber, Space, Button, Input, TreeSelect, Table, Tag, Pagination, Divider, Modal, DatePicker, message, Switch } from 'antd';
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
    SelectFilter,
} from 'ice-layout';
import { psiReduxOthers, IceStateType, supplierSlice, enums, LabelValues } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router'
import { Tool } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

class PurchaseFeeInquiry extends React.Component<{
}> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<any>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 要查看或编辑的数据
        row: (null as any),
        // 默认过滤器
        defaultFilters: {
            status: enums.STSaleOrderStatus.Completed,
            isSettlement: false,
        }
    }

    tableName = `O-SaleFeeInquiry`;

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '客户',
        key: 'businessName',
        dataIndex: 'businessName'
    }, {
        title: '订单总额',
        key: 'totalPrice',
        dataIndex: 'totalPrice',
    }, {
        title: '已支付总额',
        key: 'totalPricePaid',
        dataIndex: 'totalPricePaid',
    }, {
        title: '待支付总额',
        key: 'needPriceTotalPay',
        dataIndex: 'needPriceTotalPay',
        render: (val, row) => {
            return row.totalPrice - row.totalPricePaid;
        }
    }, {
        title: '订单总数',
        key: 'orderCount',
        dataIndex: 'orderCount',
    }];

    filterColumn: FilterColumnTypes = [{
        title: '客户',
        dataIndex: 'businessName',
        show: true,
        filter: TextFilter
    }, {
        title: '订单状态',
        dataIndex: 'status',
        show: true,
        filter: (props) => <SelectFilter
            {...props}
            filterValues={LabelValues.STSaleOrderStatus}
        />
    }, {
        title: '订单创建时间',
        dataIndex: 'creationTime',
        filter: TimeFilter
    }, {
        title: '订单完成时间',
        dataIndex: 'finishDate',
        filter: TimeFilter
    }, {
        title: '是否结算',
        dataIndex: 'isSettlement',
        show: true,
        filter: (props) => <SelectFilter
            {...props}
            filterValues={[
                { label: '已结算', value: true },
                { label: '未结算', value: false },
            ]}
        />
    }];

    render() {
        return <CommonPage
            defaultFilters={this.state.defaultFilters}
            slice={psiReduxOthers.saleFeeList.slice}
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
            scroll={{
                x: 1200
            }}
        ></CommonPage>
    }
}

export default PurchaseFeeInquiry;
