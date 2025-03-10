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
import { Edit, Add } from './Edit';
import { AreaApi, areaSlice, AreaEntity, IceStateType } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

const Print = (props: { selectRows: Array<any> }) => {
    const [printDatasKey, setPrintDatasKey] = useState(0);
    const ref = useRef<PrintDatas>();

    return <>
        <Button icon={<PrinterOutlined />} type='text'
            onClick={() => {
                if (props.selectRows.length == 0) {
                    message.warning('请选择记录');
                    return;
                }

                setPrintDatasKey(printDatasKey + 1);
                setTimeout(() => {
                    ref.current?.print();
                }, 10);
            }}
        >打印库区编码</Button>
        <PrintDatas
            key={printDatasKey}
            ref={r => ref.current = r!}
            printDatas={props.selectRows.map(item => <Barcode code={item.code} />)}
        />
    </>
}

class Area extends React.Component<{
    clearReduxDatas: () => void,
    navigate: (url: string) => void
}> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<AreaEntity>,
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
        title: '编码',
        key: 'code',
        dataIndex: 'code',
        sorter: true,
    }, {
        title: '允许的规格',
        key: 'allowSpecifications',
        dataIndex: 'allowSpecifications',
    }, {
        title: '禁止的规格',
        key: 'forbidSpecifications',
        dataIndex: 'forbidSpecifications',
    }, {
        title: '上次盘点时间',
        key: 'lastCheckTime',
        dataIndex: 'lastCheckTime',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }, {
        title: '启用/禁用',
        key: 'isActive',
        dataIndex: 'isActive',
        render: (val, row) => {
            return val ? <div style={{ color: '#87d068' }}>已启用</div> : <div style={{ color: '#f50' }}>已禁用</div>
        }
    }, {
        title: '操作',
        key: 'action',
        width: 220,
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
                <Button size='small' type='text' icon={<ArrowRightOutlined />}
                    disabled={row.isDeleted}
                    onClick={() => {
                        this.props.navigate(MenuProvider.getUrl(['baseinfo', `location?areaId=${row.id}`]));
                    }}
                >管理库位</Button>
            </ActionList>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '编码',
        dataIndex: 'code',
        show: true,
        filter: TextFilter
    }];

    fetchDelete = (row: any) => {
        Modal.confirm({
            title: `删除库区 - ${row.code}`,
            content: '确认删除库区吗？在删除库区之前你需要先清空库区下的库位',
            onOk: async () => {
                AreaApi.delete(row.id);
                message.success('删除成功');
                this.pageRef?.refresh();
                this.props.clearReduxDatas();
            }
        });
    }

    render() {
        return <>
            <CommonPage
                ref={r => this.pageRef = r}
                slice={areaSlice}
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
                    <Print selectRows={this.state.selectRows} />
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
    const navigate = useNavigate();
    const clearReduxDatas = async () => {
        await dispatch(areaSlice.actions.clearAllDatas({}) as any);
    }

    return <Area
        clearReduxDatas={clearReduxDatas}
        navigate={navigate}
    />
}
