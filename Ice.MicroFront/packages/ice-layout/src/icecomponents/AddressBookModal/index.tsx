import React, { useEffect } from 'react';
import { Modal, message, TreeSelect, Popover } from 'antd';
import { NumberOutlined, SyncOutlined } from '@ant-design/icons';
import { Row, Pagination, Table, Button } from 'antd';
import { HighLevelSearch, TextFilter } from 'ice-layout';
import { AddressBookApi, AddressBookEntity, classifySlice } from 'ice-core';
import type { IceStateType } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';

class AddressBookModal extends React.Component<{
    open: boolean,
    onOk: (rows: Array<any>) => void,
    onCancel: () => void,
}> {
    state = {
        isLoading: false,
        // 选择的数据行
        selectRows: [] as Array<AddressBookEntity>,
        // 
        filter: {} as any,
        // 
        total: 0,
        pageSize: 50,
        page: 1,
        datas: [] as Array<AddressBookEntity>,
    }

    tableName = `L-AddressbookModal`;

    columns: Array<any> = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '地址名称',
        key: 'name',
        dataIndex: 'name',
    }, {
        title: '联系人',
        key: 'contact',
        dataIndex: 'contact',
    }, {
        title: '联系电话',
        key: 'contactNumber',
        dataIndex: 'contactNumber',
    }, {
        title: '邮编',
        key: 'postcode',
        dataIndex: 'postcode',
    }, {
        title: '省/市/区',
        key: 'province',
        dataIndex: 'province',
        width: 200,
        render: (val, row) => {
            let text = [row.province, row.city, row.town].filter(e => e).join(' / ');
            return <Popover content={text}><div className='text-no-wrap'>{text}</div></Popover>
        }
    }, {
        title: '地址',
        key: 'addressDetail',
        dataIndex: 'addressDetail',
        width: 300,
        render: (val) => {
            return <Popover content={val}><div className='text-no-wrap'>{val}</div></Popover>
        }
    }];

    filterColumn: Array<any> = [{
        title: '地址名称',
        dataIndex: 'name',
        show: true,
        filter: TextFilter
    }];

    componentDidMount(): void {
        this.fetchDatas();
    }

    onOk = () => {
        if (this.state.selectRows.length == 0) {
            message.warning('请选择数据');
            return;
        }
        this.props.onOk(this.state.selectRows);
    }

    fetchDatas = async () => {
        let res = await AddressBookApi.getList(this.state.page, this.state.pageSize, this.state.filter, 'name', 'ascend');
        this.setState({
            total: res.total,
            datas: res.datas
        });
    }

    render() {
        return <Modal
            title='选择地址'
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

export default AddressBookModal;