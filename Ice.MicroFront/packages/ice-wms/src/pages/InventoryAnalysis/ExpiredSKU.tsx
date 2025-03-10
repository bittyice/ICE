import React from 'react';
import { Button, Tag, Card, Table } from 'antd';
import { NumberOutlined } from '@ant-design/icons';
import { iceFetch, Tool } from 'ice-common';
import { useSelector } from 'react-redux';
import { IceStateType } from 'ice-core';

class ExpiredSKU extends React.Component<{
    warehouseId: string
}> {
    state = {
        details: [] as Array<any>
    }

    componentDidMount() {
        this.fetchSKUs();
    }

    fetchSKUs = () => {
        let shelfLiseMin = new Date().toISOString();
        let now = new Date();
        now.setDate(now.getDate() + 30);
        let shelfLiseMax = now.toISOString();

        iceFetch<any>(`/api/wms/location-detail`, {
            method: 'GET',
            urlParams: {
                warehouseId: this.props.warehouseId,
                sorting: 'ShelfLise',
                shelfLiseMin: shelfLiseMin,
                shelfLiseMax: shelfLiseMax,
                skipCount: 0,
                maxResultCount: 10
            }
        }).then((datas) => {
            this.setState({
                details: datas.items
            });
        });
    }

    render(): React.ReactNode {
        return <Card title='即将过期的的SKU（当前时间+30天）' style={{ width: '100%' }}>
            <Table
                columns={[{
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
                }, {
                    title: '产品名',
                    key: 'name',
                    dataIndex: 'name',
                }, {
                    title: '保质期',
                    key: 'shelfLise',
                    dataIndex: 'shelfLise',
                    sorter: true,
                    render: (val) => {
                        return Tool.dateFormat(val);
                    }
                }, {
                    title: '数量',
                    key: 'quantity',
                    dataIndex: 'quantity',
                }, {
                    title: '库位编码',
                    key: 'locationCode',
                    dataIndex: 'locationCode',
                    fixed: 'right',
                    width: 120
                }]}
                dataSource={this.state.details}
                pagination={false}
            />
        </Card>
    }
}

export default () => {
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    return <ExpiredSKU warehouseId={warehouseId} />
}