import React, { useState } from 'react';
import { Segmented, Row, Space, Button, Form, Input, Tabs, Table, Tag, Pagination, Tooltip, TableColumnType, Checkbox, message } from 'antd';
import type { } from 'antd';
import { exportXLSX } from '../ExcelFile';
import HighLevelSearch, { FilterColumnType } from './HighLevelSearch';
import { SyncOutlined, ExportOutlined } from '@ant-design/icons';
import './index.css';

export type TableEXColumnType = TableColumnType<any>;
export type TableProps = React.ComponentProps<typeof Table>;

export type Sorter = {
    columnKey: string,
    field: string | undefined,
    order: "ascend" | "descend"
}

type AntTableExProps = {
    // 是否正在加载数据
    isLoading?: boolean,
    // ant rowKey
    rowKey?: TableProps['rowKey'],
    // 行选择
    rowSelection?: {
        // 选择行时回调
        onSelectChange: (selectedRowKeys: Array<any>, selectedRows: Array<any>) => void,
        // 选择行的key
        selectedRowKeys: Array<any>,
        // 选择的行
        selectedRows: Array<any>,
    },
    // antd Table scroll
    scroll?: { x?: number, y?: number },
    // antd Table columns
    columns: Array<TableEXColumnType>,
    // 数据
    datas: Array<any>,
    // Table 页发生改变时回调
    onChange: (page?: number, pageSize?: number, filter?: any, sorter?: Sorter) => void,
}

class AntTableEx extends React.Component<AntTableExProps> {
    tableRef: HTMLDivElement | null = null;

    // 列平均宽度
    colAvgWidth: number | null = null;

    state = {
        init: false,
        // table 表的 scroll
        scroll: {
            x: undefined as (number | undefined),
            y: undefined as (number | undefined)
        }
    }

    constructor(props: AntTableExProps) {
        super(props);

        if (props.scroll) {
            this.state.scroll = { ...props.scroll } as any;
        }

        if (this.state.scroll.x) {
            this.colAvgWidth = this.state.scroll.x / this.props.columns.length;
        }
    }

    componentDidMount() {
        // 等待页面渲染结束后执行
        setTimeout(() => {
            if (!this.tableRef || this.state.scroll.y) {
                return;
            }

            let newScroll = { ...this.state.scroll };

            // 获取表格的高度
            let tableH = this.tableRef.clientHeight;

            // 获取表头的高度
            // let tableHeaderH = this.tableRef.getElementsByTagName('thead')?.[0].clientHeight || 0;
            let tableHeaderH = 45;

            // 计算表body的高度
            newScroll.y = (tableH - tableHeaderH) as any;
            this.setState({
                scroll: newScroll,
                init: true
            });
        }, 1);
    }

    render(): React.ReactNode {
        return <div ref={(r) => this.tableRef = r}
            style={{
                display: 'flex',
                flexGrow: 1,
                flexShrink: 100,
                overflowY: 'hidden',
            }}>
            {
                this.state.init &&
                <Table
                    rowKey={this.props.rowKey || 'id'}
                    loading={this.props.isLoading}
                    bordered
                    columns={this.props.columns}
                    dataSource={ this.props.datas}
                    pagination={false}
                    scroll={{
                        x: this.state.scroll.x ? this.state.scroll.x : undefined,
                        y: this.state.scroll.y
                    }}
                    onChange={(pagination, filters, sorter) => {
                        this.props.onChange(
                            undefined,
                            undefined,
                            undefined,
                            sorter as any
                        );
                    }}
                    rowSelection={this.props.rowSelection ? {
                        selectedRowKeys: this.props.rowSelection.selectedRowKeys,
                        onChange: (selectedRowKeys, selectedRows) => {
                            this.props.rowSelection!.onSelectChange(selectedRowKeys, selectedRows);
                        },
                        checkStrictly: false,
                    } : undefined}
                />
            }
        </div>
    }
}

type Props = {
    // 页索引
    page: number,
    // 页大小
    pageSize: number,
    // 数据总数
    total: number,
    filter?: any,
    sorter?: Sorter,
    // 刷新
    refresh: () => void,
    filterColumns: Array<FilterColumnType>,
    // 工具条
    bottomTools?: React.ReactNode,
    // 分类设置
    classConfig?: {
        // 分类
        classes: Array<{ label: React.ReactNode, value: string }>,
        // api 查询时使用的名称
        queryName: string,
    },
    // 工具栏
    tools?: React.ReactNode,
    // 导出动作
    exportAction?: (rows: Array<any>, filter?: any) => void,
    // 页大小
    pageSizeOptions?: string[] | number[],
    // 默认过滤器
    defaultFilters?: any,
} & AntTableExProps;

export default class extends React.Component<Props> {
    exportAction = () => {
        let selectRows = this.props.rowSelection?.selectedRows || [];

        if (this.props.exportAction) {
            this.props.exportAction(selectRows, this.props.filter);
            return;
        }

        if (selectRows.length == 0) {
            message.error('请选择数据');
            return;
        }

        let exportCols = this.props.columns.filter(e => e.dataIndex);
        let excelRows: Array<any> = [];
        let header: any = {};
        exportCols.forEach(col => {
            let dataIndex = col.dataIndex as string;
            let title = typeof (col.title) == 'string' ? col.title : dataIndex;
            header[dataIndex] = title;
        });
        excelRows.push(header);
        for (let n = 0; n < selectRows.length; n++) {
            let selectRow: any = selectRows[n];
            let excelRow: any = {};
            for (let col of exportCols) {
                let dataIndex = col.dataIndex as string;
                let filed = selectRow[dataIndex];
                if (!col.render) {
                    excelRow[dataIndex] = filed;
                    continue;
                }
                let newfiled = col.render(filed, selectRow, n);
                if (typeof (newfiled) == 'object') {
                    excelRow[dataIndex] = filed;
                    continue;
                }
                excelRow[dataIndex] = newfiled;
            }
            excelRows.push(excelRow);
        }
        exportXLSX(excelRows);
    }

    render() {
        const tools = (this.props.tools);

        return <div className='flex h-full w-full'>
            <div className={`bg-white rounded-md shadow-sm flex-grow flex flex-col overflow-hidden ${this.props.classConfig ? 'rounded-tr-none' : ''}`}>
                <div className='p-3 mb-1 bg-white' style={{ borderBottom: '1px solid #e6def2' }}>
                    <HighLevelSearch
                        defaultFilters={this.props.defaultFilters}
                        columns={this.props.filterColumns}
                        onChange={(filter) => {
                            this.props.onChange(
                                1,
                                undefined,
                                {
                                    ...this.props.filter,
                                    ...filter
                                }
                            );
                        }}
                    />
                </div>
                <div className='flex flex-col flex-grow overflow-y-hidden p-3' style={{
                    flexShrink: 100,
                }}>
                    <Row justify='end' style={{ gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        {tools}
                    </Row>
                    <AntTableEx
                        isLoading={this.props.isLoading}
                        rowKey={this.props.rowKey}
                        rowSelection={this.props.rowSelection}
                        scroll={this.props.scroll}
                        columns={this.props.columns}
                        datas={this.props.datas}
                        onChange={this.props.onChange}
                    />
                </div>
                <Row className='p-3 bg-white rounded-md'>
                    <Space>
                        {this.props.bottomTools}
                        {this.props.rowSelection && <Button onClick={this.exportAction}><ExportOutlined /></Button>}
                    </Space>
                    <div style={{ flexGrow: 1 }} />
                    <Pagination
                        disabled={this.props.isLoading}
                        total={this.props.total}
                        pageSize={this.props.pageSize}
                        current={this.props.page}
                        showSizeChanger
                        pageSizeOptions={this.props.pageSizeOptions || ['10', '30', '50', '100']}
                        showQuickJumper
                        showTotal={total => <div>
                            <span style={{ marginLeft: '1rem' }}>{`共 ${total} 条`}</span>
                        </div>}
                        onChange={(page, pageSize) => {
                            this.props.onChange(page, pageSize);
                        }}
                    />
                </Row>
            </div>
            {
                this.props.classConfig &&
                <Tabs
                    className='layout-commonpage-tab'
                    tabPosition='right'
                    type='card'
                    activeKey={this.props.filter?.[this.props.classConfig.queryName]}
                    onChange={(val) => {
                        let newFilter = { ...this.props.filter };
                        newFilter[this.props.classConfig!.queryName] = val;
                        this.props.onChange(
                            undefined,
                            undefined,
                            newFilter,
                            undefined,
                        );
                    }}
                >
                    {
                        this.props.classConfig.classes.map(item => (<Tabs.TabPane tab={item.label} key={item.value} />))
                    }
                </Tabs>
            }
        </div>
    }
}