import React from 'react';
import { Typography, Pagination, Tag, Row, Tabs, Select, DatePicker, InputNumber, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, OutboundOrderApi, OutboundOrderEntity, PickListApi, PickListEntity, IceStateType, enums, ProductInfoHelper, ChinaAreaCodeHelper, LabelValues } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ArrayInput, Help, ExtraInfo, ProductInfoModal, AddressBookModal } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';

let { Title } = Typography;

// 出库单列表
const PLOutbound = class extends React.Component<{
    id: string | number | undefined,
}> {
    state = {
        isLoading: false,
        // 选择的数据行
        selectRows: [] as Array<OutboundOrderEntity>,
        // 
        filter: {
            pickListId: this.props.id
        } as any,
        // 
        total: 0,
        pageSize: 30,
        page: 1,
        datas: [] as Array<OutboundOrderEntity>,
    }

    columns: Array<any> = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '出库单号',
        key: 'outboundNumber',
        dataIndex: 'outboundNumber',
        sorter: true
    }, {
        title: '联系人',
        key: 'contact',
        dataIndex: 'contact'
    }, {
        title: '联系电话',
        key: 'contactNumber',
        dataIndex: 'contactNumber'
    }, {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        render: (val, row) => {
            return <Tag>{LabelValues.OutboundOrderStatus.find(e => e.value == val)?.label}</Tag>;
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
    }];

    componentDidMount(): void {
        this.fetchDatas();
    }

    fetchDatas = async () => {
        let res = await OutboundOrderApi.getList(this.state.page, this.state.pageSize, this.state.filter);
        this.setState({
            total: res.total,
            datas: res.datas
        });
    }

    render(): React.ReactNode {
        return <div style={{
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
    }
}

class Page extends React.Component<{}> {
    state = {
        loading: false,
        id: Tool.getUrlVariable(window.location.search, 'id')
    }

    componentDidMount() {
    }

    render() {
        return <div style={{ backgroundColor: '#fff', padding: 15 }}>
            <Tabs type='card'>
                <Tabs.TabPane key='2' tab='关联出库单'>
                    <PLOutbound
                        id={this.state.id}
                    />
                </Tabs.TabPane>
            </Tabs>
        </div>
    }
}

export default Page;