import React, { useState, useRef, useEffect } from 'react';
import { InputNumber, notification, Space, Button, Input, Tabs, Table, Tag, Pagination, Divider, Modal, DatePicker, message, Switch } from 'antd';
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
    OpenNewKey,
    LabelEX,
    SelectFilter,
    ImportExcelModal
} from 'ice-layout';
import { AreaApi, areaSlice, AreaEntity, IceStateType, ProductInfoHelper } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool } from 'ice-common';
import { wmsReduxOthers } from 'ice-core';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

type Props = {
    warehouses: Array<any>
};

class InventoryManage extends React.Component<Props> {
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

    tableName = `W-StockInquire`;

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: 'Sku',
        key: 'sku',
        dataIndex: 'sku',
        sorter: true,
        defaultSortOrder: 'descend'
    }, {
        title: '产品名',
        key: 'name',
        dataIndex: 'name',
        render: (val, row) => {
            return ProductInfoHelper.skuToProducts[row.sku]?.name;
        }
    }, {
        title: '体积',
        key: 'volume',
        dataIndex: 'volume',
        render: (val, row) => {
            return `${ProductInfoHelper.skuToProducts[row.sku]?.volume || ''}(${ProductInfoHelper.skuToProducts[row.sku]?.volumeUnit || '--'})`;
        }
    }, {
        title: '重量',
        key: 'weight',
        dataIndex: 'weight',
        render: (val, row) => {
            return `${ProductInfoHelper.skuToProducts[row.sku]?.weight || ''}(${ProductInfoHelper.skuToProducts[row.sku]?.weightUnit || '--'})`;
        }
    }, {
        title: '规格',
        key: 'specification',
        dataIndex: 'specification',
        render: (val, row) => {
            return ProductInfoHelper.skuToProducts[row.sku]?.specification;
        }
    }, {
        title: '计量单位',
        key: 'unit',
        dataIndex: 'unit',
        render: (val, row) => {
            return ProductInfoHelper.skuToProducts[row.sku]?.unit;
        }
    }, {
        title: '数量',
        key: 'quantity',
        dataIndex: 'quantity',
        fixed: 'right',
        width: 120,
        render: (val) => {
            return val || 0;
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: 'SKU',
        dataIndex: 'sku',
        show: true,
        filter: TextFilter
    }, {
        title: '仓库',
        dataIndex: 'warehouseId',
        show: true,
        filter: (props) => <SelectFilter
            {...props}
            filterValues={this.props.warehouses.map(e => ({
                label: e.name,
                value: e.id
            }))}
        />
    }];

    constructor(props: Props) {
        super(props);
    }

    render() {
        return <CommonPage
            ref={r => this.pageRef = r}
            slice={wmsReduxOthers.stockInquire.slice}
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
        />
    }
}

export default () => {
    const [refresh, setRefresh] = useState(0);
    const warehouses = useSelector((state: IceStateType) => state.warehouse.allDatas)!;
    const curPageDatas = useSelector((state: IceStateType) => state.stockInquire.curPageDatas);

    useEffect(() => {
        ProductInfoHelper.fetchProducts(curPageDatas.map(e => e.sku)).then(() => {
            setRefresh(refresh + 1);
        });
    }, [curPageDatas]);

    return <InventoryManage
        warehouses={warehouses}
    />
}
