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
    ActionList,
    LabelEX,
    ProductSelect,
} from 'ice-layout';
import { ProductInfoApi, ProductInfoEntity, IceStateType, productInfoSlice, classifySlice, ProductStockEntity, ProductStockApi } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router'
import { Tool } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

const EditStock = (props: {
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
    productInfo: ProductInfoEntity
}) => {
    const [loading, setLoading] = useState(false);
    const [stock, setStock] = useState<number>();

    const commit = async () => {
        if (stock === undefined || stock === null) {
            message.error('请输入库存数量');
            return;
        }
        setLoading(true);
        try {
            await ProductStockApi.SetStocks({
                items: [{
                    sku: props.productInfo.sku!,
                    stock: stock
                }]
            });
            props.onOk();
            message.success('已更新库存数量');
        } catch { }
        setLoading(false);
    }

    return <Modal
        title={`编辑 ${props.productInfo.name} 库存`}
        confirmLoading={loading}
        width={250}
        open={props.open}
        onCancel={props.onCancel}
        onOk={commit}
    >
        <LabelEX text='库存'>
            <InputNumber
                className='w-full'
                placeholder='请输入库存'
                precision={0}
                max={99999999}
                value={stock}
                onChange={val => {
                    setStock(val || undefined);
                }}
            />
        </LabelEX>
    </Modal>
}

const Unbox = (props: {
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
    productInfo: ProductInfoEntity
}) => {
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState<number | null>(null);

    const commit = async () => {
        if (!quantity) {
            message.error('请拆箱数量');
            return;
        }
        setLoading(true);
        try {
            // 查询产品的拆箱信息
            var product = await ProductInfoApi.get(props.productInfo.id!);
            if (!product.unboxProducts || product.unboxProducts.length == 0) {
                message.error("该产品不存在对应的拆箱产品，请先添加拆箱产品");
                setLoading(false);
                return;
            }

            await ProductStockApi.AddStocks({
                items: [
                    ...product.unboxProducts.map(item => ({
                        sku: item.sku!,
                        stock: item.quantity! * quantity
                    })),
                    {
                        sku: product.sku!,
                        stock: -quantity
                    }
                ]
            })

            props.onOk();
            message.success('成功');
        } catch { }
        setLoading(false);
    }

    return <Modal
        title={`拆箱 ${props.productInfo.name}`}
        confirmLoading={loading}
        width={250}
        open={props.open}
        onCancel={props.onCancel}
        onOk={commit}
    >
        <LabelEX text='拆箱数量'>
            <InputNumber
                className='w-full'
                placeholder='请输入拆箱数量'
                precision={0}
                max={99999999}
                value={quantity}
                onChange={val => {
                    setQuantity(val);
                }}
            />
        </LabelEX>
    </Modal>
}

type Props = {
    productStocks: Array<ProductStockEntity>
};

class ProductInfo extends React.Component<Props> {
    pageRef: CommonPageRefType | null = null;

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
        // 显示编辑库存
        showEditStock: false,
        // 显示拆箱
        showUnbox: false
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
        title: '品牌',
        key: 'brand',
        dataIndex: 'brand',
    }, {
        title: '库存',
        key: 'stock',
        dataIndex: 'stock',
        render: (val, row) => {
            return <Space>
                {this.props.productStocks.find(e => e.sku == row.sku)?.stock || 0}
                <Button size='small' type='text' icon={<EditOutlined />}
                    onClick={() => this.setState({ showEditStock: true, row: row })}
                ></Button>
            </Space>
        }
    }, {
        title: '操作',
        key: 'action',
        render: (val, row) => {
            return <Button size='small' type='link' icon={<EditOutlined />}
                onClick={() => {
                    this.setState({ showUnbox: true, row: row });
                }}
            >拆箱</Button>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '产品',
        dataIndex: 'sku',
        show: true,
        filter: (props) => {
            return <ProductSelect
                style={{ width: 120 }}
                sku={props.value}
                onSelect={product => {
                    if (!product) {
                        props.setValue(null);
                        return;
                    }
                    props.setValue(product.sku);
                }}
            />
        }
    }, {
        title: '产品名',
        dataIndex: 'name',
        show: true,
        filter: TextFilter
    }];

    constructor(props: Props) {
        super(props);

        let sku = Tool.getUrlVariable(window.location.search, 'sku');
        if (sku) {
            this.state.defaultFilters = {
                sku: sku
            }
        }
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
                    x: 1200
                }}
            ></CommonPage>
            {
                this.state.row &&
                <EditStock
                    key={this.state.row.id}
                    productInfo={this.state.row}
                    open={this.state.showEditStock}
                    onCancel={() => this.setState({ showEditStock: false })}
                    onOk={() => {
                        this.setState({ showEditStock: false });
                        this.pageRef?.refresh();
                    }}
                />
            }
            {
                this.state.row &&
                <Unbox
                    key={this.state.row.id}
                    productInfo={this.state.row}
                    open={this.state.showUnbox}
                    onCancel={() => this.setState({ showUnbox: false })}
                    onOk={() => {
                        this.setState({ showUnbox: false });
                        this.pageRef?.refresh();
                    }}
                />
            }
        </>
    }
}

export default () => {
    const [productStocks, setProductStocks] = useState<Array<ProductStockEntity>>([]);
    const curPageDatas = useSelector((state: IceStateType) => state.productInfo.curPageDatas);

    useEffect(() => {
        ProductStockApi.getListForSkus({
            skus: curPageDatas.map(e => e.sku)
        }).then(datas => {
            setProductStocks(datas);
        });
    }, [curPageDatas]);

    return <ProductInfo
        productStocks={productStocks}
    />
};