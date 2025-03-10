import React, { useEffect, useState } from 'react';
import { Select, InputNumber, Space, Button, Input, TreeSelect, Table, Tag, Pagination, Divider, Modal, DatePicker, message, Switch } from 'antd';
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
    SelectFilter,
    ImportExcelModal,
    ProductSelect
} from 'ice-layout';
import { Edit, Add } from './Edit';
import { QuoteApi, QuoteEntity, quoteSlice, supplierSlice, IceStateType, LabelValues, enums, ProductInfoHelper } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import Detail from './Detail';
import { iceFetch, Tool } from 'ice-common';

// @ts-ignore
import templete from './templete.xlsx';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

const ImportModal = OpenNewKey((props: {
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
    suppliers: Array<any>
}) => {
    const [loading, setLoading] = useState(false);
    const [supplier, setSupplier] = useState(null);
    const [datas, setDatas] = useState<Array<any>>([]);

    function fetchImport() {
        if (!supplier) {
            message.error('请选择供应商');
            return;
        }

        if (datas.length == 0) {
            message.error('请选择导入的文件');
            return;
        }

        // 检查参数
        for (let data of datas) {
            if (!data.sku) {
                message.error('SKU不能为空');
                return;
            }

            if (!data.price || data.price <= 0) {
                message.error("请输入价格，并且价格不能小于0");
                return;
            }

            let expiration: string | null = null;
            if (data.expiration) {
                try {
                    expiration = new Date(data.expiration).toISOString();
                }
                catch { }
            }

            data.expiration = expiration;
        }

        setLoading(true);
        return iceFetch('/api/psi/quote/import', {
            method: 'POST',
            body: JSON.stringify({
                supplierId: supplier,
                items: datas,
            })
        }).then(() => {
            props.onOk();
        }).finally(() => {
            setLoading(false);
        })
    }

    return <Modal
        title='导入报价'
        width={400}
        confirmLoading={loading}
        open={props.open}
        onCancel={props.onCancel}
        onOk={fetchImport}
    >
        <LabelEX isMust text={'供应商'} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'end' }}>
            <Select
                placeholder='供应商'
                style={{ width: '100%' }}
                value={supplier}
                onChange={(val) => {
                    setSupplier(val);
                }}
            >
                {
                    props.suppliers.map(e => (<Select.Option value={e.id}>{e.name}</Select.Option>))
                }
            </Select>
        </LabelEX>
        <div style={{ height: 10 }}></div>
        <LabelEX text={''} style={{ width: '100%' }} tagStyle={{ width: 90, textAlign: 'end' }}>
            <ImportExcelModal
                templateUrl={templete}
                onOk={(datas) => {
                    // 第一行是名称
                    const [one, ...others] = datas;
                    setDatas(others);
                }}
            >
                <Space>
                    <Button>选择文件</Button>
                    <span style={{ color: 'red' }}>{datas.length > 0 ? `已解析 ${datas.length} 行数据` : ''}</span>
                </Space>
            </ImportExcelModal>
        </LabelEX>
    </Modal>
})

type Props = {
    suppliers: Array<any>
};

class Quote extends React.Component<Props> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<QuoteEntity>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 显示明细
        showDetail: false,
        // 要查看或编辑的数据
        row: (null as any),
        // 默认过滤的值
        defaultFilters: undefined as any,
        // 显示导入
        shwoImport: false,
    }

    tableName = `O-Quote`;

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
        render: (val, row) => {
            return <a href="javascript:void(0)" onClick={() => {
                this.setState({ showDetail: true, row: row })
            }}>{val}</a>
        }
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
        title: '供应商',
        key: 'supplierId',
        dataIndex: 'supplierId',
        render: (val) => {
            return this.props.suppliers.find(e => e.id == val)?.name;
        }
    }, {
        title: '价格',
        key: 'price',
        dataIndex: 'price',
    }, {
        title: '过期时间',
        key: 'expiration',
        dataIndex: 'expiration',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }, {
        title: '是否过期',
        key: 'expiration',
        dataIndex: 'expiration',
        render: (val) => {
            let isExpiration = false;
            if (val) {
                let now = new Date();
                let expiration = new Date(val);
                if (now > expiration) {
                    isExpiration = true;
                }
            }

            return isExpiration ? <div color="#f50">已过期</div> : <div style={{ color: '#87d068' }}>未过期</div>
        }
    }, {
        title: '最后修改时间',
        key: 'lastModificationTime',
        dataIndex: 'lastModificationTime',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }, {
        title: '创建时间',
        key: 'creationTime',
        dataIndex: 'creationTime',
        sorter: true,
        defaultSortOrder: 'descend',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }, {
        title: '操作',
        key: 'action',
        width: 140,
        fixed: 'right',
        render: (val, row) => {
            return <Space>
                <Button size='small' type='link' icon={<EditOutlined />}
                    onClick={() => {
                        this.setState({
                            showEdit: true,
                            row: row
                        });
                    }}
                >编辑</Button>
                <Button size='small' danger type='text' icon={<DeleteOutlined />}
                    onClick={() => {
                        this.fetchDelete(row);
                    }}
                ></Button>
            </Space>
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
        title: '供应商',
        dataIndex: 'supplierId',
        show: true,
        filter: (props) => <SelectFilter
            {...props}
            filterValues={this.props.suppliers.map(item => ({ label: item.name, value: item.id }))}
        />
    }, {
        title: '创建时间',
        dataIndex: 'creationTime',
        show: true,
        filter: TimeFilter
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

    // 删除
    fetchDelete = (row: any) => {
        Modal.confirm({
            title: `删除报价 - ${row.sku}`,
            content: '确认删除吗？',
            onOk: async () => {
                await QuoteApi.delete(row.id);
                message.success('删除成功');
                this.pageRef?.refresh();
            }
        });
    }

    render() {
        return <>
            <CommonPage
                slice={quoteSlice}
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
                defaultFilters={this.state.defaultFilters}
                scroll={{
                    x: 1400
                }}
                tools={<Space>
                    <Button type='link' icon={<PlusOutlined />}
                        onClick={() => {
                            this.setState({ showAdd: true });
                        }}
                    >添加</Button>
                    <Button type='link' onClick={() => {
                        this.setState({ shwoImport: true });
                    }}>批量导入</Button>
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
                            showEdit: false,
                        });
                    }}
                    onOk={() => {
                        this.setState({
                            showEdit: false,
                        });
                        this.pageRef?.refresh();
                    }}
                />
            }
            {
                this.state.row &&
                <Detail
                    entity={this.state.row}
                    open={this.state.showDetail}
                    onCancel={() => {
                        this.setState({
                            showDetail: false,
                        });
                    }}
                />
            }
            <ImportModal
                suppliers={this.props.suppliers}
                open={this.state.shwoImport}
                onCancel={() => {
                    this.setState({ shwoImport: false });
                }}
                onOk={() => {
                    this.setState({ shwoImport: false });
                    this.pageRef?.refresh();
                }}
            />
        </>
    }
}

export default () => {
    const [refresh, setRefresh] = useState(0);
    const curPageDatas = useSelector((state: IceStateType) => state.quote.curPageDatas);
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];
    const dispatch = useDispatch();
    const fetchSuppliers = async () => {
        dispatch(supplierSlice.asyncActions.fetchAllDatas({}) as any);
    }

    useEffect(() => {
        ProductInfoHelper.fetchProducts(curPageDatas.map(e => e.sku)).then(() => {
            setRefresh(refresh + 1);
        });
    }, [curPageDatas]);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    return <Quote
        suppliers={suppliers}
    />
};
