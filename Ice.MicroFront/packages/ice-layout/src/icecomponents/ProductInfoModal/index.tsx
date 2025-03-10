import React, { useEffect } from 'react';
import { Modal, message, TreeSelect } from 'antd';
import { NumberOutlined, SyncOutlined } from '@ant-design/icons';
import { Row, Pagination, Table, Button } from 'antd';
import { HighLevelSearch, TextFilter } from 'ice-layout';
import { ProductInfoApi, ProductInfoEntity, classifySlice, ProductClassifyHelper } from 'ice-core';
import type { IceStateType } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';

type Props = {
    open: boolean,
    onOk: (rows: Array<any>) => void,
    onCancel: () => void,
}

type PageModalProps = Props & {
    classifys: Array<any>
}

class ProductInfo extends React.Component<PageModalProps> {
    productClassifyHelper: ProductClassifyHelper;

    state = {
        isLoading: false,
        // 选择的数据行
        selectRows: [] as Array<ProductInfoEntity>,
        // 
        filter: {} as any,
        // 
        total: 0,
        pageSize: 50,
        page: 1,
        datas: [] as Array<ProductInfoEntity>,
    }

    tableName = `L-ProductInfoModal`;

    columns: Array<any> = [{
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
        defaultSortOrder: 'descend'
    }, {
        title: '产品名',
        key: 'name',
        dataIndex: 'name',
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
        title: '计量单位',
        key: 'unit',
        dataIndex: 'unit',
        fixed: 'right',
        width: 100,
    }];

    filterColumn: Array<any> = [{
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
                placeholder='产品分类'
                className='bg-gray-100'
                allowClear
                style={{ width: 170 }}
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

    constructor(props: PageModalProps) {
        super(props);

        this.productClassifyHelper = new ProductClassifyHelper(this.props.classifys);
    }

    componentDidMount(): void {
        this.fetchDatas();
    }

    shouldComponentUpdate(nextProps: Readonly<PageModalProps>, nextState: Readonly<{}>, nextContext: any): boolean {
        if (nextProps.classifys != this.props.classifys) {
            this.productClassifyHelper = new ProductClassifyHelper(nextProps.classifys);
        }

        return true;
    }

    onOk = () => {
        if (this.state.selectRows.length == 0) {
            message.warning('请选择数据');
            return;
        }
        this.props.onOk(this.state.selectRows);
    }

    fetchDatas = async () => {
        let res = await ProductInfoApi.getList(this.state.page, this.state.pageSize, this.state.filter, 'sku', 'ascend');
        this.setState({
            total: res.total,
            datas: res.datas
        });
    }

    render() {
        return <Modal
            title='选择产品'
            width={1000}
            open={this.props.open}
            onOk={this.onOk}
            onCancel={this.props.onCancel}
        >
            <div style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{
                    marginBottom: '0.5rem',
                    backgroundColor: '#fff',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    paddingLeft: '0.75rem',
                    paddingRight: '0.75rem',
                    borderRadius: '0.5rem'
                }}>
                    <HighLevelSearch
                        columns={this.filterColumn}
                        onChange={(filter) => {
                            this.setState({ filter }, () => {
                                this.fetchDatas();
                            });
                        }}
                    />
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    flexShrink: 100,
                    overflowY: 'hidden',
                    marginBottom: '0.5rem',
                    backgroundColor: '#fff',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    paddingLeft: '0.75rem',
                    paddingRight: '0.75rem',
                    borderRadius: '0.5rem'
                }}>
                    <Row justify='space-between' style={{ gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <Button
                            icon={<SyncOutlined />}
                            onClick={this.fetchDatas}
                        >刷新</Button>
                    </Row>
                    <div
                        style={{
                            display: 'flex',
                            flexGrow: 1,
                            flexShrink: 100,
                            overflowY: 'hidden',
                        }}>
                        <Table
                            rowKey='id'
                            bordered
                            loading={this.state.isLoading}
                            size='small'
                            columns={this.columns}
                            dataSource={this.state.datas}
                            pagination={false}
                            scroll={{
                                y: 600
                            }}
                            rowSelection={{
                                selectedRowKeys: this.state.selectRows.map(item => item.id!),
                                onChange: (selectedRowKeys, selectedRows) => {
                                    this.setState({
                                        selectRows: selectedRows
                                    });
                                },
                                checkStrictly: false,
                            }}
                        />
                    </div>
                </div>
                <Row>
                    <div style={{ flexGrow: 1 }} />
                    <Pagination
                        disabled={this.state.isLoading}
                        total={this.state.total}
                        pageSize={this.state.pageSize}
                        current={this.state.page}
                        showSizeChanger
                        pageSizeOptions={['10', '30', '50', '100']}
                        showQuickJumper
                        showTotal={total => <div>
                            <span style={{ marginLeft: '1rem' }}>{`共 ${total} 条`}</span>
                        </div>}
                        onChange={(page, pageSize) => {
                            this.setState({
                                page,
                                pageSize
                            }, () => {
                                this.fetchDatas();
                            });
                        }}
                    />
                </Row>
            </div>
        </Modal>
    }
}

export default (props: Props) => {
    const classifys = useSelector((state: IceStateType) => state.classify.allDatas) || [];
    const dispatch = useDispatch();
    const fetchClassifys = async () => {
        dispatch(classifySlice.asyncActions.fetchAllDatas({}) as any);
    }

    useEffect(() => {
        fetchClassifys();
    }, []);

    return <ProductInfo
        {...props}
        classifys={classifys}
    />
};