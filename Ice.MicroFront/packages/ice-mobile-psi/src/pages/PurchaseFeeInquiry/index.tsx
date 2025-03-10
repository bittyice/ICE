import React, { useEffect, useState } from 'react';
import { Tag } from 'antd-mobile';
import { PrinterOutlined, NumberOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ArrowRightOutlined } from '@ant-design/icons';
import {
    TextFilter,
    TimeFilter,
    CommonPage,
    CommonPageRefType,
    CommonPageProps,
    SelectFilter,
} from 'ice-mobile-layout';
import { psiReduxOthers, IceStateType, supplierSlice, enums, LabelValues } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router'
import { Tool } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

class PurchaseFeeInquiry extends React.Component<{
    suppliers: Array<any>
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
            status: enums.OMSPurchaseOrderStatus.Completed,
            isSettlement: false,
        }
    }

    tableName = `O-PurchaseFeeInquiry`;

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '供应商',
        dataIndex: 'supplierId',
        render: (val, row) => {
            let supplier = this.props.suppliers.find(e => e.id == val);
            return supplier?.name;
        }
    }, {
        title: '供应商状态',
        dataIndex: 'isActive',
        render: (val, row) => {
            let supplier = this.props.suppliers.find(e => e.id == row.supplierId);
            return supplier?.isActive ? <Tag color="#87d068">已启用</Tag> : <Tag color="#f50">已禁用</Tag>;
        }
    }, {
        title: '供应商编码',
        dataIndex: 'supplierId',
        render: (val, row) => {
            return this.props.suppliers.find(e => e.id == val)?.code;
        }
    }, {
        title: '采购总额',
        dataIndex: 'priceTotal',
    }, {
        title: '已支付总额',
        dataIndex: 'priceTotalPaid',
    }, {
        title: '待支付总额',
        dataIndex: 'needPriceTotalPay',
        render: (val, row) => {
            return row.priceTotal - row.priceTotalPaid;
        }
    }, {
        title: '订单总数',
        dataIndex: 'orderCount',
    }];

    filterColumn: FilterColumnTypes = [{
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
        title: '订单状态',
        dataIndex: 'status',
        show: true,
        filter: (props) => <SelectFilter
            {...props}
            filterValues={LabelValues.OMSPurchaseOrderStatus}
        />
    }, {
        title: '订单创建时间',
        dataIndex: 'creationTime',
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
            slice={psiReduxOthers.purchaseFeeList.slice}
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

export default () => {
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];
    const dispatch = useDispatch();
    const fetchSuppliers = async () => {
        dispatch(supplierSlice.asyncActions.fetchAllDatas({}) as any);
    }

    useEffect(() => {
        fetchSuppliers();
    }, []);

    return <PurchaseFeeInquiry
        suppliers={suppliers}
    />
};

