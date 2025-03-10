import React, { useState, useRef } from 'react';
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
    MenuProvider,
    ActionList
} from 'ice-layout';
import { AreaApi, areaSlice, AreaEntity, IceStateType, WarehouseMessageApi, warehouseMessageSlice } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool } from 'ice-common';
import Detail from './Detail';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

class WarehouseMessage extends React.Component<{}> {
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
        // 显示详情
        showDetail: false,
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
        title: '标题',
        key: 'title',
        dataIndex: 'title',
        sorter: true,
    }, {
        title: '是否已读',
        key: 'readed',
        dataIndex: 'readed',
        render: (val) => {
            return val ? <div>已读</div> : <div style={{ color: '#87d068' }}>未读</div>
        }
    }, {
        title: '接收时间',
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
        render: (val, row) => {
            return <ActionList>
                <Button size='small' type='text'
                    onClick={() => {
                        this.setState({
                            showDetail: true,
                            row: row
                        });
                    }}
                >详情</Button>
                <Button size='small' type='link'
                    disabled={row.readed == true}
                    onClick={() => {
                        this.fetchRead(row);
                    }}
                >标记已读</Button>
            </ActionList>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '标题',
        dataIndex: 'title',
        show: true,
        filter: TextFilter
    }, {
        title: '接收时间',
        dataIndex: 'creationTime',
        show: true,
        filter: TimeFilter
    }];

    fetchRead(row: any) {
        WarehouseMessageApi.read(row.id).then(() => {
            this.pageRef?.refresh();
        });
    }

    render() {
        return <>
            <CommonPage
                ref={r => this.pageRef = r}
                slice={warehouseMessageSlice}
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
            />
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
        </>
    }
}

export default WarehouseMessage;
