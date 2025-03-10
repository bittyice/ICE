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
    SelectFilter
} from 'ice-layout';
import { wmsReduxOthers, IceStateType, ProductInfoHelper, LabelValues, StockChangeLogEntity, stockChangeLogSlice } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

type Props = {
    warehouses: Array<any>,
};

class StockChangeLog extends React.Component<Props> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<StockChangeLogEntity>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 要查看或编辑的数据
        row: (null as any),
        // 默认过滤的值
        defaultFilters: undefined as any,
    }

    tableName = `W-StockChangeLog`;

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
        defaultSortOrder: 'descend'
    }, {
        title: '产品名',
        key: 'name',
        dataIndex: 'name',
        render: (val, row) => {
            return ProductInfoHelper.skuToProducts[row.sku]?.name;
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
        title: '库位',
        key: 'location',
        dataIndex: 'location',
        fixed: 'right',
    }, {
        title: '数量',
        key: 'quantity',
        dataIndex: 'quantity',
        fixed: 'right',
    }, {
        title: '时间',
        key: 'creationTime',
        dataIndex: 'creationTime',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }];

    constructor(props: Props) {
        super(props);
    }

    render() {
        return <CommonPage
            ref={r => this.pageRef = r}
            slice={stockChangeLogSlice}
            columns={this.columns}
            filterColumns={[]}
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
    const curPageDatas = useSelector((state: IceStateType) => state.stockChangeLog.curPageDatas);

    useEffect(() => {
        ProductInfoHelper.fetchProducts(curPageDatas.map(e => e.sku)).then(() => {
            setRefresh(refresh + 1);
        });
    }, [curPageDatas]);

    return <StockChangeLog
        warehouses={warehouses}
    />
}
