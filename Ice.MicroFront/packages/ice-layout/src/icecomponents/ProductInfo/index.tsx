import React, { useEffect, useState } from 'react';
import { Typography, InputNumber, Space, Button, Input, TreeSelect, Table, Tag, Pagination, Divider, Modal, DatePicker, message, Switch } from 'antd';
import { PrinterOutlined, NumberOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ArrowRightOutlined } from '@ant-design/icons';
import {
    TextFilter,
    TimeFilter,
    ChecksFilter,
    NumFilter,
    CommonPage,
    CommonPageRefType,
    CommonPageProps,
    MenuProvider,
    OpenNewKey,
    LabelEX,
    ActionList,
} from 'ice-layout';
import { Edit, Add } from './Edit';
import { ProductInfoApi, ProductInfoEntity, IceStateType, productInfoSlice, classifySlice, ProductClassifyHelper, ProductInfoHelper } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router'
import { Tool } from 'ice-common';
import ProductImportBtn from './ProductImportBtn';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

type Props = {
    classifys: Array<any>,
    navigate: (url: string) => void,
};

class ProductInfo extends React.Component<Props> {
    notificationKey = 'ProductInfo';
    pageRef: CommonPageRefType | null = null;
    productClassifyHelper: ProductClassifyHelper;

    state = {
        // 选择的数据行
        selectRows: [] as Array<ProductInfoEntity>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 要查看或编辑的数据
        row: (null as any),
        // 默认过滤的值
        defaultFilters: undefined as any,
    }

    tableName = `O-ProductInfo`;

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
        width: 180
    }, {
        title: '产品价格',
        key: 'price',
        dataIndex: 'price',
        render: (val, row) => {
            return `${val} ￥`;
        }
    }, {
        title: '计量单位',
        key: 'unit',
        dataIndex: 'unit',
    }, {
        title: '体积',
        key: 'volume',
        dataIndex: 'volume',
    }, {
        title: '体积单位',
        key: 'volumeUnit',
        dataIndex: 'volumeUnit',
        render: (val, row) => {
            return val || '--';
        }
    }, {
        title: '重量',
        key: 'weight',
        dataIndex: 'weight',
    }, {
        title: '重量单位',
        key: 'weightUnit',
        dataIndex: 'weightUnit',
        render: (val, row) => {
            return val || '--';
        }
    }, {
        title: '品牌',
        key: 'brand',
        dataIndex: 'brand',
    }, {
        title: '分类',
        key: 'classifyId',
        dataIndex: 'classifyId',
        render: (val, row) => {
            return this.props.classifys.find(e => e.id == val)?.name;
        }
    }, {
        title: '规格',
        key: 'specification',
        dataIndex: 'specification',
    }, {
        title: '操作',
        key: 'action',
        width: 150,
        fixed: 'right',
        render: (val, row) => {
            return <ActionList>
                <Button size='small' type='link' icon={<EditOutlined />}
                    disabled={row.groupId != null}
                    onClick={() => {
                        this.setState({
                            showEdit: true,
                            row: row
                        });
                    }}
                >编辑</Button>
                <Button size='small' danger type='link' icon={<DeleteOutlined />}
                    disabled={row.groupId != null}
                    onClick={() => {
                        this.fetchDelete(row);
                    }}
                ></Button>
            </ActionList>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: 'SKU',
        dataIndex: 'sku',
        show: true,
        filter: TextFilter
    }, {
        title: '产品名',
        dataIndex: 'name',
        show: true,
        filter: TextFilter
    }, {
        title: '产品分类',
        dataIndex: 'classifyId',
        show: true,
        filter: (props) => {
            return <TreeSelect
                bordered={false}
                className='bg-gray-100'
                placeholder='产品分类'
                allowClear
                style={{ width: 160 }}
                treeDefaultExpandAll
                treeData={this.productClassifyHelper.treeClassifys}
                fieldNames={{
                    label: 'name',
                    value: 'id',
                    children: 'children'
                }}
                value={props.value}
                onChange={(val) => {
                    props.setValue(val);
                }}
            >
            </TreeSelect>
        }
    }];

    constructor(props: Props) {
        super(props);

        let sku = Tool.getUrlVariable(window.location.search, 'sku');
        if (sku) {
            this.state.defaultFilters = {
                sku: sku
            }
        }
        this.productClassifyHelper = new ProductClassifyHelper(this.props.classifys);
    }

    shouldComponentUpdate(nextProps: Props) {
        if (nextProps.classifys != this.props.classifys) {
            this.productClassifyHelper = new ProductClassifyHelper(nextProps.classifys);
        }
        return true;
    }

    fetchDelete = (row: any) => {
        Modal.confirm({
            title: `删除产品 - ${row.sku}`,
            content: '确认删除吗？',
            onOk: () => {
                Modal.confirm({
                    title: `再次确认操作 - ${row.sku}`,
                    content: '我们希望你不是手误，删除产品后我们将无法为你展示该产品所对应SKU的任何信息，这些信息包括采购单明细，入库单明细，出库单明细，库存明细等。是否确认删除？',
                    onOk: async () => {
                        await ProductInfoApi.delete(row.id);
                        this.pageRef?.refresh();
                        message.success('删除成功');
                    }
                });
            }
        });
    }

    render() {
        return <>
            <CommonPage
                hasExtraInfo
                slice={productInfoSlice}
                ref={r => this.pageRef = r}
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
                    x: 1800
                }}
                tools={<Space>
                    <Button type='link' icon={<PlusOutlined />}
                        onClick={() => {
                            this.setState({ showAdd: true });
                        }}
                    >添加</Button>
                    <ProductImportBtn
                        onOk={() => {
                            this.pageRef?.refresh();
                        }}
                    />
                </Space>}
            ></CommonPage>
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
                        ProductInfoHelper.clearProductInfo(this.state.row.sku);
                        this.pageRef?.refresh();
                    }}
                />
            }
        </>
    }
}

export default () => {
    const classifys = useSelector((state: IceStateType) => state.classify.allDatas) || [];
    const dispatch = useDispatch();
    const nav = useNavigate();
    const fetchClassifys = async () => {
        dispatch(classifySlice.asyncActions.fetchAllDatas({}) as any);
    }

    useEffect(() => {
        fetchClassifys();
    }, []);

    return <ProductInfo
        classifys={classifys}
        navigate={nav}
    />
};