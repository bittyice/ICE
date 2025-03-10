import React, { useEffect } from 'react';
import { Space, DatePicker, Select, Table, Button, message } from 'antd';
import { enums, IceStateType, LabelValues, supplierSlice, ProductInfoHelper, paymentMethodSlice, PaymentMethodEntity } from 'ice-core';
import { exportXLSX, LabelEX } from 'ice-layout';
import dayjs from 'dayjs';
import { iceFetch, Tool } from 'ice-common';
import { useSelector, useDispatch } from 'react-redux';

type Props = {
    suppliers: Array<any>,
    paymentMethods: Array<PaymentMethodEntity>
}

class PurchaseDetailReport extends React.Component<Props> {
    state = {
        dateRange: [null, null] as [dayjs.Dayjs | null, dayjs.Dayjs | null],
        isSettlement: null as (boolean | null),
        warehouseId: null,
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
        return iceFetch<any>('/api/psi/purchase-detail-report', {
            method: 'GET',
            urlParams: {
                startTime: start,
                endTime: end,
                warehouseId: this.state.warehouseId,
                isSettlement: this.state.isSettlement,
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
            newData.paymentMethodName = !data.paymentMethodId ? '系统默认'
                : (this.props.paymentMethods.find(e => e.id === data.paymentMethodId)?.name || '未知');
            newData.supplier = this.props.suppliers.find(e => e.id == data.supplierId)?.name;
            newData.productName = ProductInfoHelper.skuToProducts[data.sku]?.name;
            newData.productUnit = ProductInfoHelper.skuToProducts[data.sku]?.unit;
            newData.quantity = data.quantity;
            newData.giveQuantity = data.giveQuantity;
            newData.totalAmount = data.unitPrice * data.quantity;
            newData.creationTime = Tool.dateFormat(data.creationTime);
            newData.finishDate = Tool.dateFormat(data.finishDate);
            newDates.push(newData);
        }
        return newDates;
    }

    exportFile = () => {
        let newDates = this.getDatas();
        newDates.unshift({
            orderNumber: '单号',
            paymentMethodName: '支付方式',
            supplier: '供应商',
            productName: '产品名',
            productUnit: '产品单位',
            quantity: '采购数量',
            giveQuantity: '赠送数量',
            totalAmount: '总额',
            creationTime: '创建时间',
            finishDate: '完成时间'
        });
        exportXLSX(newDates, undefined, '采购明细表.xlsx');
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
                        key: 'orderNumber'
                    }, {
                        title: '支付方式',
                        dataIndex: 'paymentMethodName',
                        key: 'paymentMethodName'
                    }, {
                        title: '供应商',
                        dataIndex: 'supplier',
                        key: 'supplier'
                    }, {
                        title: '产品名',
                        dataIndex: 'productName',
                        key: 'productName'
                    }, {
                        title: '产品单位',
                        dataIndex: 'productUnit',
                        key: 'productUnit'
                    }, {
                        title: '采购数量',
                        dataIndex: 'quantity',
                        key: 'quantity'
                    }, {
                        title: '赠送数量',
                        dataIndex: 'giveQuantity',
                        key: 'giveQuantity'
                    }, {
                        title: '总额',
                        dataIndex: 'totalAmount',
                        key: 'totalAmount'
                    }, {
                        title: '创建时间',
                        dataIndex: 'creationTime',
                        key: 'creationTime'
                    }, {
                        title: '完成时间',
                        dataIndex: 'finishDate',
                        key: 'finishDate'
                    }]}
                    pagination={false}
                >
                </Table>
            </div>
        </div>
    }
}

export default () => {
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];
    const paymentMethods = useSelector((state: IceStateType) => state.paymentMethod.allDatas) || [];
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(supplierSlice.asyncActions.fetchAllDatas({}) as any);
        dispatch(paymentMethodSlice.asyncActions.fetchAllDatas({}) as any);
    }, []);

    return <PurchaseDetailReport
        suppliers={suppliers}
        paymentMethods={paymentMethods}
    />
};
