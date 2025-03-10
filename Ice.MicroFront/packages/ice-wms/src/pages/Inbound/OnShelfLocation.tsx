import React, { useEffect } from 'react';
import { Modal, message, TreeSelect, Popover } from 'antd';
import { NumberOutlined, SyncOutlined } from '@ant-design/icons';
import { Row, Pagination, Table, Button } from 'antd';
import { HighLevelSearch, OpenNewKey, TextFilter } from 'ice-layout';
import { stockChangeLogSlice, StockChangeLogEntity, StockChangeLogApi, productInfoSlice } from 'ice-core';
import type { IceStateType, ProductInfoEntity } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import { Tool } from 'ice-common';

type Props = {
    open: boolean,
    onCancel: () => void,
    inboundOrderId: string,
}

class OnShelfLocation extends React.Component<Props & {
    productInfos: Array<ProductInfoEntity>
}> {
    state = {
        isLoading: false,
        // 选择的数据行
        selectRows: [] as Array<StockChangeLogEntity>,
        // 
        filter: {
            relationId: this.props.inboundOrderId
        } as any,
        // 
        total: 0,
        pageSize: 30,
        page: 1,
        datas: [] as Array<StockChangeLogEntity>,
    }

    tableName = `onShelfLocation-${this.props.inboundOrderId}`;

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
    }, {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
        render: (val, row) => {
            return this.props.productInfos.find(e => e.sku === row.sku)?.name;
        }
    }, {
        title: '计量单位',
        key: 'unit',
        dataIndex: 'unit',
        render: (val, row) => {
            return this.props.productInfos.find(e => e.sku === row.sku)?.unit;
        }
    }, {
        title: '上架库位',
        key: 'location',
        dataIndex: 'location',
    }, {
        title: '上架数量',
        key: 'quantity',
        dataIndex: 'quantity',
    }, {
        title: '操作时间',
        key: 'creationTime',
        dataIndex: 'creationTime',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }];

    componentDidMount(): void {
        this.fetchDatas();
    }

    fetchDatas = async () => {
        let res = await StockChangeLogApi.getList(this.state.page, this.state.pageSize, this.state.filter);
        this.setState({
            total: res.total,
            datas: res.datas
        });
    }

    render() {
        return <Modal
            title='上架库位'
            width={1000}
            open={this.props.open}
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

export default OpenNewKey((props: Props) => {
    const productInfos = useSelector((state: IceStateType) => state.productInfo.allDatas) || [];
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(productInfoSlice.asyncActions.fetchAllDatas({}) as any);
    }, []);

    return <OnShelfLocation
        {...props}
        productInfos={productInfos}
    />
});