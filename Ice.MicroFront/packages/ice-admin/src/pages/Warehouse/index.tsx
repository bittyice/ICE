import React from 'react';
import { Col, Row, Space, Button, Input, Tabs, Table, Tag, Pagination, Divider, Modal, DatePicker, message, Switch } from 'antd';
import { SyncOutlined, NumberOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ArrowRightOutlined } from '@ant-design/icons';
import {
    TextFilter,
    TimeFilter,
    ChecksFilter,
    NumFilter,
    CommonPage,
    CommonPageRefType,
    CommonPageProps
} from 'ice-layout';
import { Edit, Add } from './Edit';
import { WarehouseApi, warehouseSlice, WarehouseEntity } from 'ice-core';
import { useDispatch } from 'react-redux';
import { Tool } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

class Warehouse extends React.Component<{
    clearReduxDatas: () => void
}> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<WarehouseEntity>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 要查看或编辑的数据
        row: (null as any),
    }

    tableName = `A-Warehouse`;

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
    }, {
        title: '仓库名',
        key: 'name',
        dataIndex: 'name',
        sorter: true,
    }, {
        title: '负责人',
        key: 'principal',
        dataIndex: 'principal',
        sorter: true,
    }, {
        title: '联系电话',
        key: 'contactNumber',
        dataIndex: 'contactNumber',
        sorter: true,
    }, {
        title: '省/市/区',
        key: 'town',
        dataIndex: 'town',
        render: (val, row) => {
            return [row.province, row.city, row.town].filter(e => e).join(' / ');
        }
    }, {
        title: '启用/禁用',
        key: 'isActive',
        dataIndex: 'isActive',
        render: (val, row) => {
            return val ? <div style={{color: '#87d068'}}>已启用</div> : <div style={{color: '#f50'}}>已禁用</div>
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
        width: 150,
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
                <Button size='small' danger type='link' icon={<DeleteOutlined />}
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
        title: '创建时间',
        dataIndex: 'creationTime',
        show: true,
        filter: TimeFilter
    }];

    fetchDelete = (row: any) => {
        Modal.confirm({
            title: `删除仓库 - ${row.name}`,
            content: '确认删除吗？该操作无法撤销，请慎重操作',
            onOk: () => {
                Modal.confirm({
                    title: `删除操作 - ${row.name}`,
                    content: '请再次确认操作！！！',
                    onOk: async () => {
                        await WarehouseApi.delete(row.id);
                        message.success('删除成功');
                        this.pageRef?.refresh();
                    }
                });
            }
        });
    }

    render() {
        return <>
            <CommonPage
                ref={r => this.pageRef = r}
                slice={warehouseSlice}
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
                            showEdit: false
                        });
                    }}
                    onOk={() => {
                        this.setState({
                            showEdit: false
                        });
                        this.pageRef?.refresh();
                        this.props.clearReduxDatas();
                    }}
                />
            }
        </>
    }
}

export default () => {
    const dispatch = useDispatch();
    const clearReduxDatas = async () => {
        await dispatch(warehouseSlice.actions.clearAllDatas({}) as any);
    }

    return <Warehouse clearReduxDatas={clearReduxDatas} />
}