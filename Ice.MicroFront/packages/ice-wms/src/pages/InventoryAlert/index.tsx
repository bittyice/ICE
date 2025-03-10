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
import { Edit, Add } from './Edit';
import { InventoryAlertApi, inventoryAlertSlice, InventoryAlertEntity, IceStateType, ProductInfoHelper } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool } from 'ice-common';
import { AlertQuantityHelp } from '../../components/Helps';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

class InventoryAlert extends React.Component<{}> {
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
        title: 'SKU',
        key: 'sku',
        dataIndex: 'sku',
        sorter: true,
        defaultSortOrder: 'descend'
    }, {
        title: '产品名称',
        key: 'sku',
        dataIndex: 'sku',
        render: (val, row) => {
            return ProductInfoHelper.skuToProducts[val]?.name
        }
    }, {
        title: <div><span>预警数量</span><AlertQuantityHelp /></div>,
        key: 'quantity',
        dataIndex: 'quantity',
    }, {
        title: '启用/禁用',
        key: 'isActive',
        dataIndex: 'isActive',
        render: (val, row) => {
            return val ? <div style={{ color: '#87d068' }}>已启用</div> : <div style={{ color: '#f50' }}>已禁用</div>
        }
    }, {
        title: '创建时间',
        key: 'creationTime',
        dataIndex: 'creationTime',
        render: (val, row) => {
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
                <Button size='small' danger type='link' icon={<DeleteOutlined />}
                    onClick={() => {
                        this.fetchDelete(row);
                    }}
                ></Button>
            </Space>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: 'SKU',
        dataIndex: 'sku',
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
            title: `删除预警 - ${row.sku}`,
            content: '确认删除吗？',
            onOk: () => {
                InventoryAlertApi.delete(row.id).then(() => {
                    message.success('删除成功');
                    this.pageRef?.refresh();
                });
            }
        });
    }

    render() {
        return <>
            <CommonPage
                ref={r => this.pageRef = r}
                slice={inventoryAlertSlice}
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
    const [refresh, setRefresh] = useState(0);
    const curPageDatas = useSelector((state: IceStateType) => state.inventoryAlert.curPageDatas);

    useEffect(() => {
        ProductInfoHelper.fetchProducts(curPageDatas.map(e => e.sku)).then(() => {
            setRefresh(refresh + 1);
        });
    }, [curPageDatas]);

    return <InventoryAlert />
}