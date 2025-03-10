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
    MenuProvider,
    SelectFilter,
    ActionList
} from 'ice-layout';
import { Add } from './Edit';
import { AreaApi, areaSlice, AreaEntity, IceStateType, WarehouseCheckApi, warehouseCheckSlice, WarehouseCheckEntity, enums, LabelValues } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool } from 'ice-common';
import WarehouseCheckLocation from './WarehouseCheckLocation';

export { default as Check } from './Check';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

class WarehouseCheck extends React.Component<{
    warehouseId: string,
    areas: Array<any>,
    navigate: (url: any) => void,
}> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<WarehouseCheckEntity>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 要查看或编辑的数据
        row: (null as any),
        // 显示盘点库位
        showWarehouseCheckLocation: false
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
        title: '盘点库区',
        key: 'areaId',
        dataIndex: 'areaId',
        render: (val) => {
            return this.props.areas.find(e => e.id == val)?.code;
        }
    }, {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        render: (val, row) => {
            let labelValue = LabelValues.WarehouseCheckStatus.find(e => e.value == val);
            return <div style={{ color: labelValue?.color }}>{labelValue?.label}</div>
        }
    }, {
        title: '开始时间',
        key: 'checkStartTime',
        dataIndex: 'checkStartTime',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }, {
        title: '完成时间',
        key: 'checkFinishTime',
        dataIndex: 'checkFinishTime',
        render: (val) => {
            return Tool.dateFormat(val);
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
        width: 220,
        fixed: 'right',
        render: (val, row) => {
            return <ActionList>
                {
                    row.status == enums.WarehouseCheckStatus.Waiting &&
                    <Button size='small' type='link'
                        onClick={() => {
                            this.fetchStart(row);
                        }}
                    >开始盘点</Button>
                }
                {
                    row.status == enums.WarehouseCheckStatus.Checking &&
                    <Button size='small'  type='link'
                        onClick={() => {
                            this.props.navigate(MenuProvider.getUrl(['warehouseopt', `location-check?id=${row.id}`]));
                        }}
                    >去盘点</Button>
                }
                {
                    row.status == enums.WarehouseCheckStatus.Checking &&
                    <Button size='small' type='link'
                        onClick={() => {
                            this.fetchFinish(row);
                        }}
                    >完成盘点</Button>
                }
                {
                    (
                        row.status == enums.WarehouseCheckStatus.Waiting ||
                        row.status == enums.WarehouseCheckStatus.Checking
                    ) &&
                    <Button size='small' danger  type='link'
                        onClick={() => {
                            this.fetchInvalid(row);
                        }}
                    >作废</Button>
                }
                {
                    row.status == enums.WarehouseCheckStatus.Invalid &&
                    <Button size='small' danger type='link' icon={<DeleteOutlined />}
                        onClick={() => {
                            this.fetchDelete(row);
                        }}
                    ></Button>
                }
                {
                    row.status == enums.WarehouseCheckStatus.Checked &&
                    <Button size='small'  type='link'
                        onClick={() => {
                            this.setState({ showWarehouseCheckLocation: true, row: row });
                        }}
                    >盘点库位</Button>
                }
            </ActionList>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '库区',
        dataIndex: 'areaId',
        show: true,
        filter: (props) => <SelectFilter
            {...props}
            filterValues={this.props.areas.map(e => ({ label: e.userName, value: e.id }))}
        />
    }];

    fetchDelete = (row: any) => {
        Modal.confirm({
            title: `删除任务`,
            content: '确认删除该任务吗？',
            onOk: async () => {
                await WarehouseCheckApi.delete(row.id);
                message.success('删除成功');
                this.pageRef?.refresh();
            }
        });
    }

    // 作废
    fetchInvalid = (row: any) => {
        Modal.confirm({
            title: `作废`,
            content: '确认作废吗？',
            onOk: async () => {
                await WarehouseCheckApi.invalid(row.id);
                message.success('作废成功');
                this.pageRef?.refresh();
            }
        });
    }

    // 开始
    fetchStart = (row: any) => {
        Modal.confirm({
            title: `开始盘点`,
            content: '确认开始盘点吗？',
            onOk: async () => {
                await WarehouseCheckApi.start(row.id);
                message.success('已经开始盘点');
                this.pageRef?.refresh();
            }
        });
    }

    fetchFinish = (row: any) => {
        Modal.confirm({
            title: `结束盘点`,
            content: '确认结束盘点吗？',
            onOk: async () => {
                await WarehouseCheckApi.finish(row.id);
                message.success('已经结束盘点');
                this.pageRef?.refresh();
            }
        });
    }

    render() {
        return <>
            <CommonPage
                ref={r => this.pageRef = r}
                slice={warehouseCheckSlice}
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
                    >添加盘点任务</Button>
                    <Button type='link' ghost
                        onClick={() => {
                            this.props.navigate(MenuProvider.getUrl(['warehouseopt', `location-check`]));
                        }}
                    >直接盘点</Button>
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
                }}
            />
            {
                this.state.row &&
                <WarehouseCheckLocation
                    id={this.state.row.id}
                    open={this.state.showWarehouseCheckLocation}
                    onCancel={() => {
                        this.setState({
                            showWarehouseCheckLocation: false,
                        });
                    }}
                />
            }
        </>
    }
}

export default () => {
    const dispatch = useDispatch();
    const areas = useSelector((state: IceStateType) => state.area.allDatas) || [];
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    const navigate = useNavigate();
    const fetchDatas = async () => {
        return dispatch(areaSlice.asyncActions.fetchAllDatas({}) as any);
    }

    useEffect(() => {
        fetchDatas();
    }, []);

    return <WarehouseCheck
        warehouseId={warehouseId}
        areas={areas}
        navigate={navigate}
    />
}
