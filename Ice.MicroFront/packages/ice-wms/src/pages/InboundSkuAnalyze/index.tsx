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
import { wmsReduxOthers, IceStateType, ProductInfoHelper, LabelValues } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

class InboundSkuAnalyze extends React.Component<{
    warehouses: Array<any>,
}> {
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

    tableName = `W-InboundSkuAnalyze`;

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
        dataIndex: 'sku'
    }, {
        title: '产品名称',
        key: 'sku',
        dataIndex: 'sku',
        render: (val, row) => {
            return ProductInfoHelper.skuToProducts[row.sku]?.name;
        }
    }, {
        title: '计量单位',
        key: 'sku',
        dataIndex: 'sku',
        render: (val, row) => {
            return ProductInfoHelper.skuToProducts[row.sku]?.unit;
        }
    }, {
        title: '入库总数',
        key: 'total',
        dataIndex: 'total',
    }];

    filterColumn: FilterColumnTypes = [{
        title: '仓库',
        dataIndex: 'warehouseId',
        show: true,
        filter: (props) => <SelectFilter
            {...props}
            filterValues={this.props.warehouses.map(item => ({
                label: item.name,
                value: item.id
            }))}
        />
    }, {
        title: '订单状态',
        dataIndex: 'status',
        show: true,
        filter: (props) => <SelectFilter
            {...props}
            filterValues={LabelValues.InboundOrderStatus}
        />
    }, {
        title: '类型',
        dataIndex: 'type',
        filter: (props) => <SelectFilter
            {...props}
            filterValues={LabelValues.InboundOrderType}
        />
    }, {
        title: '订单创建时间',
        dataIndex: 'creationTime',
        show: true,
        filter: TimeFilter
    }];

    render() {
        return <CommonPage
            ref={r => this.pageRef = r}
            slice={wmsReduxOthers.inboundSkuReport.slice}
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
    const curPageDatas = useSelector((state: IceStateType) => state.inboundSkuReport.curPageDatas);

    useEffect(() => {
        ProductInfoHelper.fetchProducts(curPageDatas.map(e => e.sku)).then(() => {
            setRefresh(refresh + 1);
        });
    }, [curPageDatas]);

    return <InboundSkuAnalyze
        warehouses={warehouses}
    />
}
