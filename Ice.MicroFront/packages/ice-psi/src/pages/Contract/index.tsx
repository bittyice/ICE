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
import { ContractApi, ContractEntity, IceStateType, contractSlice, supplierSlice } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router'
import { Tool } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

type Props = {
    suppliers: Array<any>,
    navigate: (url: string) => void,
};

class Contract extends React.Component<Props> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<ContractEntity>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 要查看或编辑的数据
        row: (null as any),
    }

    tableName = `O-Contract`;

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '合同编号',
        key: 'contractNumber',
        dataIndex: 'contractNumber',
        sorter: true,
    }, {
        title: '合同名称',
        key: 'contractName',
        dataIndex: 'contractName',
        sorter: true,
    }, {
        title: '供应商',
        key: 'supplierId',
        dataIndex: 'supplierId',
        render: (val) => {
            let supplier = this.props.suppliers.find(e => e.id == val);
            if (!supplier) {
                return null;
            }

            return <a href='javascript:void(0)' onClick={() => {
                this.props.navigate(MenuProvider.getUrl(['baseinfo', `supplier?code=${supplier.code}`]));
            }}>{supplier.name}</a>;
        }
    }, {
        title: '生效时间',
        key: 'effectiveTime',
        dataIndex: 'effectiveTime',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }, {
        title: '过期时间',
        key: 'expiration',
        dataIndex: 'expiration',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }, {
        title: '是否过期',
        key: 'expiration',
        dataIndex: 'expiration',
        render: (val) => {
            let isExpiration = false;
            if (val) {
                let now = new Date();
                let expiration = new Date(val);
                if (now > expiration) {
                    isExpiration = true;
                }
            }

            return isExpiration ? <div color="#f50">已过期</div> : <div style={{ color: '#87d068' }}>未过期</div> 
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
                <Button size='small' danger type='text' icon={<DeleteOutlined />}
                    onClick={() => {
                        this.fetchDelete(row);
                    }}
                ></Button>
            </Space>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '合同编号',
        dataIndex: 'contractNumber',
        show: true,
        filter: TextFilter
    }, {
        title: '合同名称',
        dataIndex: 'contractName',
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
            title: `删除合同 - ${row.contractName}`,
            content: '确认删除吗？',
            onOk: async () => {
                await ContractApi.delete(row.id!);
                message.success('删除成功');
                this.pageRef?.refresh();
            }
        });
    }

    render() {
        return <>
            <CommonPage
                hasExtraInfo
                slice={contractSlice}
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
                    }}
                />
            }
        </>
    }
}

export default () => {
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];
    const dispatch = useDispatch();
    const nav = useNavigate();
    const fetchSuppliers = async () => {
        dispatch(supplierSlice.asyncActions.fetchAllDatas({}) as any);
    }

    useEffect(() => {
        fetchSuppliers();
    }, []);

    return <Contract
        suppliers={suppliers}
        navigate={nav}
    />
};