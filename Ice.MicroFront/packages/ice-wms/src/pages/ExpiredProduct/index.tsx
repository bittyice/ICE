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
import { wmsReduxOthers, IceStateType, ProductInfoHelper, LabelValues, locationSlice, locationDetailSilce } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

type Props = {
    warehouseId: string
};

class ExpiredProduct extends React.Component<Props> {
    readonly storageExpiredName = "_ExpiredProduct_Expired_";

    pageRef: CommonPageRefType | null = null;

    currentDate = new Date();

    state = {
        // 选择的数据行
        selectRows: [] as Array<any>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 要查看或编辑的数据
        row: (null as any),
        defaultFilters: {
            warehouseId: this.props.warehouseId,
            shelfLise: [null, new Date()]
        }
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
        title: 'Sku',
        key: 'sku',
        dataIndex: 'sku',
        sorter: true,
    }, {
        title: '产品名',
        key: 'name',
        dataIndex: 'name',
        render: (val, row) => {
            return ProductInfoHelper.skuToProducts[row.sku]?.name;
        }
    }, {
        title: '计量单位',
        key: 'unit',
        dataIndex: 'unit',
        render: (val, row) => {
            return ProductInfoHelper.skuToProducts[row.sku]?.unit;
        }
    }, {
        title: '入库批次号',
        key: 'inboundBatch',
        dataIndex: 'inboundBatch',
        sorter: true,
    }, {
        title: '数量',
        key: 'quantity',
        dataIndex: 'quantity',
    }, {
        title: '过期',
        key: 'shelfLise',
        dataIndex: 'shelfLise',
        render: (val, row) => {
            if(val && (this.currentDate > new Date(val))) {
                return <div style={{color: "#f5222d"}}>已过期</div>
            }
            return <div style={{color: "#fa8c16"}}>未过期</div>
        }
    }, {
        title: '保质期',
        key: 'shelfLise',
        dataIndex: 'shelfLise',
        sorter: true,
        defaultSortOrder: 'ascend',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }, {
        title: '库位编码',
        key: 'locationCode',
        dataIndex: 'locationCode',
        fixed: 'right',
        width: 150
    },];

    filterColumn: FilterColumnTypes = [{
        title: 'SKU',
        dataIndex: 'sku',
        show: true,
        filter: TextFilter
    }, {
        title: '入库批次号',
        dataIndex: 'inboundBatch',
        show: true,
        filter: TextFilter
    }, {
        title: '过期时间',
        dataIndex: 'shelfLise',
        show: true,
        filter: TimeFilter
    }];

    render() {
        return <CommonPage
            ref={r => this.pageRef = r}
            defaultFilters={this.state.defaultFilters}
            slice={locationDetailSilce}
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
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    const curPageDatas = useSelector((state: IceStateType) => state.locationDetail.curPageDatas);

    useEffect(() => {
        ProductInfoHelper.fetchProducts(curPageDatas.map(e => e.sku)).then(() => {
            setRefresh(refresh + 1);
        });
    }, [curPageDatas]);

    return <ExpiredProduct
        warehouseId={warehouseId}
    />
}
