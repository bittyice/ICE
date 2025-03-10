import React from 'react';
import { Button, Tag, Card, Table } from 'antd';
import { IceStateType, LabelValues, enums } from 'ice-core';
import { iceFetch, Tool } from 'ice-common';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { MenuProvider } from 'ice-layout';

class InboundOrder extends React.Component<{
    warehouseId: string,
    navigate: (url: any) => void
}> {
    state = {
        orders: [] as Array<any>
    }

    componentDidMount() {
        this.fetchInboundOrders();
    }

    fetchInboundOrders = () => {
        iceFetch<any>(`/api/wms/inbound`, {
            method: 'GET',
            urlParams: {
                warehouseId: this.props.warehouseId,
                status: enums.InboundOrderStatus.UnderInspection,
                skipCount: 0,
                maxResultCount: 5
            }
        }).then((datas) => {
            this.setState({
                orders: datas.items
            });
        });
    }

    render(): React.ReactNode {
        return <Table
            className='w-full'
            bordered
            columns={[{
                title: '待验货入库单',
                key: 'inboundNumber',
                dataIndex: 'inboundNumber',
            }, {
                title: '入库类型',
                key: 'type',
                dataIndex: 'type',
                render: (val, row) => {
                    let labelValue = LabelValues.InboundOrderType.find(e => e.value == val);
                    return <Tag color={labelValue?.color}>{labelValue?.label}</Tag>;
                }
            }, {
                title: '入库批次号',
                key: 'inboundBatch',
                dataIndex: 'inboundBatch',
            }, {
                title: '创建时间',
                key: 'creationTime',
                dataIndex: 'creationTime',
                render: (val) => {
                    return Tool.dateFormat(val);
                }
            }, {
                title: '操作',
                key: 'action',
                width: 200,
                fixed: 'right',
                render: (val, row) => {
                    return <Button size='small'
                        onClick={() => {
                            this.props.navigate(MenuProvider.getUrl(['outinbound', `check?id=${row.id}`]));
                        }}
                    >去验货</Button>
                }
            }]}
            dataSource={this.state.orders}
            pagination={false}
        />
    }
}

export default () => {
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    const navigate = useNavigate();
    return <InboundOrder warehouseId={warehouseId} navigate={navigate} />
}