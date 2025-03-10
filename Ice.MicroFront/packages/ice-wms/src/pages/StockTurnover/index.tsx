import React, { useState, useRef, useEffect } from 'react';
import { Typography, InputNumber, Space, Select, Input, Tabs, Table, Tag, Pagination, Divider, Modal, DatePicker, message, Switch } from 'antd';
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
    Help
} from 'ice-layout';
import { wmsReduxOthers, IceStateType, ProductInfoHelper, LabelValues, enums, productInfoSlice } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool, iceFetch } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

export const NounHelp = () => {
    const HelpContent = <div>
        <Typography.Title level={5}>名称解释</Typography.Title>
        <Typography.Paragraph>统计时段：从几天前开始统计，如：30表示从30天前开始统计</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>时段出库数：这段时间内出了多少SKU</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>期初库存数：这段时间开始时的库存，其值 = 当前库存数 + 时段出库数</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>库存周转率：{'库存周转率 = 出库总量 / ((期初库存数 + 当前库存数) / 2)'}</Typography.Paragraph>
    </div>

    return <Help title='库存周转率说明' body={HelpContent} >
        名词解释
    </Help>
}

// 全局保存，否则切换页面再切回来数据不见了
var days: number = 90;
var warehouseId: string | null = null;
var outboundTotals = {} as any;
var skuStocks = {} as any;

type Props = {
    warehouses: Array<any>
};

class StockTurnover extends React.Component<Props> {
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
        // 默认过滤的值
        defaultFilters: undefined as any,
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
        defaultSortOrder: 'descend',
        width: 150,
    }, {
        title: '产品名',
        key: 'name',
        dataIndex: 'name',
        sorter: true,
    }, {
        title: '计量单位',
        key: 'unit',
        dataIndex: 'unit',
    }, {
        title: '当前库存数',
        key: 'currentStock',
        dataIndex: 'currentStock',
        render: (val, row) => {
            return skuStocks[row.sku] || 0;
        }
    }, {
        title: '时段出库数',
        key: 'outboundQuantity',
        dataIndex: 'outboundQuantity',
        render: (val, row) => {
            return outboundTotals[row.sku] || 0;
        }
    }, {
        title: '期初库存数',
        key: 'startStock',
        dataIndex: 'startStock',
        render: (val, row) => {
            return (skuStocks[row.sku] || 0) + (outboundTotals[row.sku] || 0);
        }
    }, {
        title: '库存周转率',
        key: 'startStock',
        dataIndex: 'startStock',
        render: (val, row) => {
            let curStock = skuStocks[row.sku] || 0;
            let outboundNum = outboundTotals[row.sku] || 0;
            let startStock = curStock + outboundNum;
            // 库存周转率 = 出库总量 / 平均库存
            let rate = (outboundNum / ((startStock + curStock) / 2)) * 100;
            if (isNaN(rate)) {
                rate = 0;
            }
            return `${rate.toFixed(2)} %`;
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: 'SKU',
        dataIndex: 'sku',
        show: true,
        filter: TextFilter
    }, {
        title: '统计时段',
        dataIndex: 'date',
        show: true,
        filter: (props) => (<InputNumber
            style={{ width: 150 }}
            defaultValue={days}
            addonAfter='天'
            onChange={val => {
                days = val || 0;
            }}
        />)
    }, {
        title: '统计仓库',
        dataIndex: 'warehouseId',
        show: true,
        filter: (props) => (<Select
            style={{ width: 150 }}
            defaultValue={warehouseId}
            placeholder='统计仓库'
            allowClear
            onChange={(val) => {
                warehouseId = val;
            }}
        >
            {
                this.props.warehouses.map(item => (<Select.Option value={item.id}>{item.name}</Select.Option>))
            }
        </Select>)
    }];

    constructor(props: Props) {
        super(props);
    }

    render() {
        return <CommonPage
            hasExtraInfo
            ref={r => this.pageRef = r}
            slice={productInfoSlice}
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
                <NounHelp />
            </Space>}
        />
    }
}

export default () => {
    const [refresh, setRefresh] = useState(0);
    const warehouses = useSelector((state: IceStateType) => state.warehouse.allDatas)!;
    const curPageDatas = useSelector((state: IceStateType) => state.productInfo.curPageDatas);

    const fetchOutboundSkuReport = (skus: Array<string>) => {
        if (!skus || skus.length == 0) {
            return Promise.resolve();
        }

        let startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return iceFetch<Array<any>>('/api/wms/product-report/outbound-sku-report-for-skus', {
            method: 'GET',
            urlParams: {
                skus,
                creationTimeMin: startDate.toISOString(),
                status: enums.OutboundOrderStatus.Outofstock,
                warehouseId: warehouseId,
            }
        }).then(datas => {
            outboundTotals = {};
            datas.forEach((data: any) => {
                outboundTotals[data.sku] = data.total;
            })
        });
    }

    const fetchSkuStocks = (skus: Array<string>) => {
        if (!skus || skus.length == 0) {
            return Promise.resolve();
        }

        return iceFetch<Array<any>>('/api/wms/location-detail/stock-inquire-for-skus', {
            method: 'GET',
            urlParams: {
                warehouseId: warehouseId,
                skus
            }
        }).then(datas => {
            skuStocks = {} as any;
            datas.forEach((data: any) => {
                skuStocks[data.sku] = data.quantity;
            })
        });
    }

    useEffect(() => {
        let skus = curPageDatas.map(e => e.sku);
        Promise.all([
            fetchOutboundSkuReport(skus),
            fetchSkuStocks(skus)
        ]).then(() => {
            setRefresh(refresh + 1);
        });
    }, [curPageDatas]);

    return <StockTurnover
        warehouses={warehouses}
    />
}