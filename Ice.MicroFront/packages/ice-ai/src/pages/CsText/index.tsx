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
import { CsTextApi, CsTextEntity, csTextSlice } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router'
import { Tool } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

type Props = {
    clearReduxDatas: () => void
};

class CsText extends React.Component<Props> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<CsTextEntity>,
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

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '组名称',
        key: 'groupName',
        dataIndex: 'groupName'
    }, {
        title: '操作',
        key: 'action',
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

    filterColumn: FilterColumnTypes = [];

    // 删除
    fetchDelete = (row: any) => {
        Modal.confirm({
            title: `删除 ${row.groupName}`,
            content: '确认删除吗？',
            onOk: async () => {
                await CsTextApi.delete(row.id);
                this.pageRef?.refresh();
                this.props.clearReduxDatas();
                message.success('删除成功');
            }
        });
    }

    render() {
        return <>
            <CommonPage
                hasExtraInfo
                defaultFilters={this.state.defaultFilters}
                slice={csTextSlice}
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
        </>
    }
}

export default () => {
    const dispatch = useDispatch();
    const clearReduxDatas = async () => {
        await dispatch(csTextSlice.actions.clearAllDatas({}) as any);
    }
    
    return <CsText clearReduxDatas={clearReduxDatas} />
}