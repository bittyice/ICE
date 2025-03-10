import React, { useState } from 'react';
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
    ActionList
} from 'ice-layout';
import { Edit, Add } from './Edit';
import { AddressBookApi, addressBookSlice, AddressBookEntity } from 'ice-core';
import { useDispatch } from 'react-redux';
import AddressImportBtn from './AddressImportBtn';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

class AddressBook extends React.Component<{
    clearReduxDatas: () => void,
}> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<AddressBookEntity>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 要查看或编辑的数据
        row: (null as AddressBookEntity | null),
    }

    tableName = `L-Addressbook`;

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '地址名称',
        key: 'name',
        dataIndex: 'name',
        sorter: true,
        defaultSortOrder: 'descend',
    }, {
        title: '联系人',
        key: 'contact',
        dataIndex: 'contact',
    }, {
        title: '联系电话',
        key: 'contactNumber',
        dataIndex: 'contactNumber',
    }, {
        title: '邮编',
        key: 'postcode',
        dataIndex: 'postcode',
    }, {
        title: '省/市/区',
        key: 'town',
        dataIndex: 'town',
        render: (val, row) => {
            return [row.province, row.city, row.town].filter(e => e).join(' / ');
        }
    }, {
        title: '地址',
        key: 'addressDetail',
        dataIndex: 'addressDetail',
    }, {
        title: '操作',
        key: 'action',
        width: 200,
        fixed: 'right',
        render: (val, row) => {
            return <ActionList>
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
            </ActionList>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '地址名称',
        dataIndex: 'name',
        show: true,
        filter: TextFilter
    }];

    fetchDelete = (row: AddressBookEntity) => {
        Modal.confirm({
            title: `删除地址 - ${row.name}`,
            content: '确认删除吗？',
            onOk: async () => {
                await AddressBookApi.delete(row.id!);
                message.success('删除成功');
                this.pageRef?.refresh();
            }
        });
    }

    render() {
        return <>
            <CommonPage
                ref={r => this.pageRef = r}
                slice={addressBookSlice}
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
                tools={<ActionList>
                    <Button type='link' icon={<PlusOutlined />}
                        onClick={() => {
                            this.setState({ showAdd: true });
                        }}
                    >添加</Button>
                    <AddressImportBtn
                        onOk={() => {
                            this.pageRef?.refresh();
                        }}
                    />
                </ActionList>}
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
        await dispatch(addressBookSlice.actions.clearAllDatas({}) as any);
    }

    return <AddressBook clearReduxDatas={clearReduxDatas} />
}
