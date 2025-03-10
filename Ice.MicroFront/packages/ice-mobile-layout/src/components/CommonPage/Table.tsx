import React from 'react';
import HighLevelSearch, { FilterColumnType } from './HighLevelSearch';
import { SyncOutlined, ExportOutlined } from '@ant-design/icons';
import IceFormList from '../IceFormList';
import { InfiniteScroll, Tabs } from 'antd-mobile';

export type TableEXColumnType = {
    title: React.ReactNode,
    dataIndex?: string,
    render?: (val: any, row: any, index: number) => React.ReactNode
}

type Props = {
    // 页索引
    page: number,
    // 页大小
    pageSize: number,
    // 数据总数
    total: number,
    // 数据
    datas: Array<any>,
    filter?: any,
    // Table 页发生改变时回调
    onChange: (page?: number, pageSize?: number, filter?: any) => Promise<any>,
    // 刷新
    refresh: () => Promise<any>,
    // antd Table columns
    columns: Array<TableEXColumnType>,
    filterColumns: Array<FilterColumnType>,
    // antd Table scroll
    scroll?: { x?: number, y?: number }
    // 是否正在加载数据
    isLoading?: boolean,
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
    defaultFilters?: any,
};

export default class extends React.Component<Props> {
    tableRef: HTMLDivElement | null = null;

    // 列平均宽度
    colAvgWidth: number | null = null;

    state = {
        // table 表的 scroll
        scroll: {
            x: undefined as (number | undefined),
            y: undefined as (number | undefined)
        }
    }

    constructor(props: Props) {
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
            let tableHeaderH = this.tableRef.getElementsByTagName('thead')?.[0].clientHeight || 0;

            // 计算表body的高度
            newScroll.y = (tableH - tableHeaderH) as any;
            this.setState({
                scroll: newScroll
            });
        }, 1);
    }

    render() {
        return <div style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <div className='shadow-sm p-3 mb-1 bg-white'>
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
            <div className='flex flex-col flex-grow overflow-y-auto shadow-sm rounded-2xl w-full'
                style={{
                    flexShrink: 100,
                }}
            >
                {
                    this.props.classConfig &&
                    <Tabs
                        className='bg-white'
                        style={{ flexGrow: 1 }}
                        activeKey={this.props.filter?.[this.props.classConfig.queryName]}
                        onChange={(val) => {
                            let newFilter = { ...this.props.filter };
                            newFilter[this.props.classConfig!.queryName] = val;
                            this.props.onChange(
                                undefined,
                                undefined,
                                newFilter,
                            );
                        }}
                    >
                        {
                            this.props.classConfig.classes.map(item => (<Tabs.Tab title={item.label} key={item.value}></Tabs.Tab>))
                        }
                    </Tabs>
                }
                <IceFormList
                    columns={this.props.columns}
                    dataSource={this.props.datas}
                />
                <InfiniteScroll
                    hasMore={(this.props.page * this.props.pageSize) < this.props.total}
                    loadMore={() => {
                        return this.props.onChange(this.props.page + 1, this.props.pageSize);
                    }}
                ></InfiniteScroll>
            </div>
        </div>
    }
}