import React, { useState, useRef, useEffect } from 'react';
import { Col, Row, Space, Button, Input, Tabs, Table, Tag, Pagination, Divider, Modal, DatePicker, message, Switch } from 'antd';
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
    MenuProvider
} from 'ice-layout';
import { Add } from './Edit';
import { WarehouseTransferApi, warehouseTransferSlice, WarehouseTransferEntity, IceStateType, WarehouseEntity, LabelValues, warehouseCheckSlice, addressBookSlice } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

class WarehouseTransfer extends React.Component<{
    warehouses: Array<WarehouseEntity>
}> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<WarehouseTransferEntity>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 要查看或编辑的数据
        row: (null as any),
    }

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '任务编号',
        key: 'transferNumber',
        dataIndex: 'transferNumber',
        sorter: true,
    }, {
        title: '始发仓',
        key: 'originWarehouseId',
        dataIndex: 'originWarehouseId',
        sorter: true,
        render: (val) => {
            return this.props.warehouses.find(e => e.id == val)?.name;
        }
    }, {
        title: '出库单号',
        key: 'outboundOrderNumber',
        dataIndex: 'outboundOrderNumber',
        width: 180,
    }, {
        title: '出库单状态',
        key: 'outboundOrderStatus',
        dataIndex: 'outboundOrderStatus',
        render: (val) => {
            var labelValue = LabelValues.OutboundOrderStatus.find(e => e.value == val);
            return <div style={{ color: labelValue?.color }}>{labelValue?.label}</div>
        }
    }, {
        title: '目的仓',
        key: 'destinationWarehouseId',
        dataIndex: 'destinationWarehouseId',
        sorter: true,
        render: (val) => {
            return this.props.warehouses.find(e => e.id == val)?.name;
        }
    }, {
        title: '入库单号',
        key: 'inboundOrderNumber',
        dataIndex: 'inboundOrderNumber',
        width: 180,
    }, {
        title: '入库单状态',
        key: 'inboundOrderStatus',
        dataIndex: 'inboundOrderStatus',
        render: (val) => {
            var labelValue = LabelValues.InboundOrderStatus.find(e => e.value == val);
            return <div style={{ color: labelValue?.color }}>{labelValue?.label}</div>
        }
    }, {
        title: '创建时间',
        key: 'creationTime',
        dataIndex: 'creationTime',
        sorter: true,
        defaultSortOrder: 'descend',
        fixed: 'right',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '任务编号',
        dataIndex: 'transferNumber',
        show: true,
        filter: TextFilter
    }];

    render() {
        return <>
            <CommonPage
                ref={r => this.pageRef = r}
                slice={warehouseTransferSlice}
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
                tools={<Space>
                    <Button type='link' icon={<PlusOutlined />}
                        onClick={() => {
                            this.setState({ showAdd: true });
                        }}
                    >添加</Button>
                </Space>}
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
        </>
    }
}

export default () => {
    const dispatch = useDispatch();
    const warehouses = useSelector((state: IceStateType) => state.warehouse.allDatas) || [];

    useEffect(() => {
        dispatch(addressBookSlice.asyncActions.fetchAllDatas({}) as any);
    }, []);

    return <WarehouseTransfer
        warehouses={warehouses}
    />
}