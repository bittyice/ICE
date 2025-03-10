import React, { useEffect, useState } from 'react';
import { Col, Row, Space, Button, Input, Tabs, Table, Tag, Pagination, Divider, Modal, DatePicker, message, Switch } from 'antd';
import { PrinterOutlined, NumberOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ArrowRightOutlined } from '@ant-design/icons';
import {
    TextFilter,
    TimeFilter,
    ChecksFilter,
    NumFilter,
    CommonPage,
    CommonPageRefType,
    CommonPageProps,
    MenuProvider
} from 'ice-layout';
import { Edit, Add } from './Edit';
import Detail from './Detail';
import { SupplierApi, SupplierEntity, IceStateType, supplierSlice } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router'
import { Tool } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

type Props = {
    clearReduxDatas: () => void
};

class Supplier extends React.Component<Props> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<SupplierEntity>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 显示明细
        showDetail: false,
        // 要查看或编辑的数据
        row: (null as any),
        // 默认过滤的值
        defaultFilters: undefined as any
    }

    tableName = `O-Supplier`;

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '编码',
        key: 'code',
        dataIndex: 'code',
        sorter: true,
        render: (val, row) => {
            return <a href="javascript:void(0)" onClick={() => {
                this.setState({ showDetail: true, row: row })
            }}>{val}</a>
        }
    }, {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
    }, {
        title: '联系人',
        key: 'contact',
        dataIndex: 'contact',
    }, {
        title: '联系电话',
        key: 'contactNumber',
        dataIndex: 'contactNumber',
    }, {
        title: '启用/禁用',
        key: 'isActive',
        dataIndex: 'isActive',
        render: (val, row) => {
            return val ? <div style={{ color: '#87d068' }}>已启用</div> : <div color="#f50">已禁用</div>
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
            return <Space>
                <Button size='small' type='link' icon={<EditOutlined />}
                    onClick={() => {
                        this.setState({
                            showEdit: true,
                            row: row
                        });
                    }}
                >编辑</Button>
                <Button size='small' danger type='text' icon={<DeleteOutlined />}
                    onClick={() => {
                        this.fetchDelete(row);
                    }}
                ></Button>
            </Space>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '编码',
        dataIndex: 'code',
        show: true,
        filter: TextFilter
    }, {
        title: '名称',
        dataIndex: 'name',
        show: true,
        filter: TextFilter
    }, {
        title: '联系人',
        dataIndex: 'contact',
        show: true,
        filter: TextFilter
    }, {
        title: '联系电话',
        dataIndex: 'contactNumber',
        filter: TextFilter
    }, {
        title: '创建时间',
        dataIndex: 'creationTime',
        filter: TimeFilter
    }];

    constructor(props: Props) {
        super(props);

        let code = Tool.getUrlVariable(window.location.search, 'code');
        if (code) {
            this.state.defaultFilters = {
                code: code
            }
        }
    }

    // 删除
    fetchDelete = (row: any) => {
        Modal.confirm({
            title: `删除供应商 - ${row.code}`,
            content: '确认删除吗？',
            onOk: () => {
                SupplierApi.delete(row.id);
                this.pageRef?.refresh();
                message.success('删除成功');
                this.props.clearReduxDatas();
            }
        });
    }

    render() {
        return <>
            <CommonPage
                hasExtraInfo
                defaultFilters={this.state.defaultFilters}
                slice={supplierSlice}
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
                    this.props.clearReduxDatas();
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
                        this.props.clearReduxDatas();
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
        </>
    }
}

export default () => {
    const dispatch = useDispatch();
    const clearReduxDatas = async () => {
        await dispatch(supplierSlice.actions.clearAllDatas({}) as any);
    }
    
    return <Supplier clearReduxDatas={clearReduxDatas} />
}