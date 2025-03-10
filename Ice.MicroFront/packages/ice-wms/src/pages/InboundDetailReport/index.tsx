import React from 'react';
import { Space, DatePicker, Select, Table, Button, message } from 'antd';
import { LabelValues, enums, ProductInfoHelper, IceStateType } from 'ice-core';
import { exportXLSX, LabelEX } from 'ice-layout';
import dayjs from 'dayjs';
import { iceFetch, Tool } from 'ice-common';
import { useSelector } from 'react-redux';

type Props = {
    warehouseId: string
}

class DetailReport extends React.Component<Props> {
    state = {
        dateRange: [null, null] as [dayjs.Dayjs | null, dayjs.Dayjs | null],
        isSettlement: null as (boolean | null),
        datas: [] as Array<any>
    }

    constructor(props: Props) {
        super(props);

        let now = new Date();
        let start = new Date();
        start.setMonth(now.getMonth() - 1);
        this.state.dateRange = [dayjs(start), dayjs(now)];
    }

    componentDidMount(): void {
        this.fetchDatas();
    }

    fetchDatas = () => {
        const [startTime, endTime] = this.state.dateRange;
        const stime = startTime!.toDate();
        const eTime = endTime!.toDate();
        const start = new Date(stime!.getFullYear(), stime!.getMonth(), stime!.getDate()).toISOString();
        const end = new Date(eTime!.getFullYear(), eTime!.getMonth(), eTime!.getDate(), 23, 59, 59).toISOString();
        return iceFetch<Array<any>>('/api/wms/detail-report/inbound', {
            method: 'GET',
            urlParams: {
                startTime: start,
                endTime: end,
                warehouseId: this.props.warehouseId,
            }
        }).then((datas: Array<any>) => {
            this.setState({ datas: datas });
            ProductInfoHelper.fetchProducts(datas.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        });
    }

    getDatas() {
        let newDates: Array<any> = [];
        for (let data of this.state.datas) {
            let newData: any = {};
            newData.orderNumber = data.orderNumber;
            newData.inboundBatch = data.inboundBatch;
            newData.productName = ProductInfoHelper.skuToProducts[data.sku]?.name;
            newData.productUnit = ProductInfoHelper.skuToProducts[data.sku]?.unit;
            newData.quantity = data.quantity;
            newData.otherInfo = data.otherInfo;
            newData.creationTime = Tool.dateFormat(data.creationTime);
            newDates.push(newData);
        }
        return newDates;
    }

    exportFile = () => {
        let newDates = this.getDatas();
        newDates.unshift({
            orderNumber: '单号',
            inboundBatch: '入库批次号',
            productName: '产品名',
            productUnit: '产品单位',
            quantity: '数量',
            otherInfo: '其他',
            creationTime: '创建时间'
        });
        exportXLSX(newDates, undefined, '订单明细表.xlsx');
    }

    render(): React.ReactNode {
        let newDates = this.getDatas();
        return <div>
            <Space style={{ width: '100%', backgroundColor: '#fff', padding: '6px 0px' }}>
                <LabelEX text='时间范围'>
                    <DatePicker.RangePicker
                        allowClear={false}
                        value={this.state.dateRange}
                        onChange={vals => {
                            this.setState({ dateRange: vals });
                        }}
                    />
                </LabelEX>
                <LabelEX text='是否结算'>
                    <Select
                        style={{ width: 200 }}
                        placeholder='请选择'
                        allowClear
                        value={this.state.isSettlement}
                        onChange={(val) => {
                            this.setState({ isSettlement: val });
                        }}
                    >
                        <Select.Option value={false}>否</Select.Option>
                        <Select.Option value={true}>是</Select.Option>
                    </Select>
                </LabelEX>
                <Button type='primary' onClick={this.fetchDatas}>查询</Button>
                <Button type='primary' onClick={this.exportFile}>导出</Button>
            </Space>
            <div style={{ marginTop: 10, backgroundColor: '#fff', padding: 10 }}>
                <Table
                    bordered
                    dataSource={newDates}
                    columns={[{
                        title: '单号',
                        dataIndex: 'orderNumber',
                        key: 'orderNumber',
                        width: 180
                    }, {
                        title: '入库批次号',
                        dataIndex: 'inboundBatch',
                        key: 'inboundBatch'
                    }, {
                        title: '产品名',
                        dataIndex: 'productName',
                        key: 'productName'
                    }, {
                        title: '产品单位',
                        dataIndex: 'productUnit',
                        key: 'productUnit'
                    }, {
                        title: '数量',
                        dataIndex: 'quantity',
                        key: 'quantity'
                    }, {
                        title: '其他',
                        dataIndex: 'otherInfo',
                        key: 'otherInfo'
                    }, {
                        title: '创建时间',
                        dataIndex: 'creationTime',
                        key: 'creationTime',
                        width: 140,
                    }]}
                    pagination={false}
                >
                </Table>
            </div>
        </div>
    }
}

export default () => {
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    return <DetailReport warehouseId={warehouseId} />;
};