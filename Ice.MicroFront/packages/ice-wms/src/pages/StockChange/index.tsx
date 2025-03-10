import React from 'react';
import { iceFetch } from 'ice-common';
import { exportXLSX } from 'ice-layout';
import { Table, Typography, Button } from 'antd';
import { IceStateType, ProductInfoApi } from 'ice-core';
import { useSelector } from 'react-redux';

class StockChange extends React.Component<{
    warehouseId: string
}> {
    configs: Array<{ title: string, key: string, dataIndex: string, fixed?: 'left' | 'right', width?: number }> = [];

    state = {
        months: [] as Array<{ year: number, month: number }>,
        datas: [] as Array<any>
    }

    componentDidMount(): void {
        this.fetchDatas();
    }

    fetchDatas = () => {
        Promise.all([
            ProductInfoApi.getAll(),
            iceFetch<any>('/api/wms/stock-change-report/stock-change-of-warehouse', {
                method: 'GET',
                urlParams: {
                    warehouseId: this.props.warehouseId
                }
            })
        ]).then((arr) => {
            const [products, stockChanges] = arr;
            let now = new Date();
            // 月初
            let monthStart = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
            let months: Array<{ year: number, month: number }> = [];
            months.unshift({ year: monthStart.getFullYear(), month: monthStart.getMonth() + 1 });
            for (let n = 1; n <= 18; n++) {
                monthStart.setMonth(monthStart.getMonth() - 1);
                months.unshift({ year: monthStart.getFullYear(), month: monthStart.getMonth() + 1 });
            }

            this.configs = [];
            this.configs.push({
                title: 'SKU',
                key: 'sku',
                dataIndex: 'sku',
                width: 150,
                fixed: 'left'
            });
            this.configs.push({
                title: '名称',
                key: 'name',
                dataIndex: 'name',
                width: 150,
                fixed: 'left'
            });
            for (let month of months) {
                // 数据格式 yyyy-mm-in | yyyy-mm-out
                this.configs.push({
                    title: `${month.year}-${month.month}-入`,
                    key: `${month.year}-${month.month}-in`,
                    dataIndex: `${month.year}-${month.month}-in`,
                });
                this.configs.push({
                    title: `${month.year}-${month.month}-出`,
                    key: `${month.year}-${month.month}-out`,
                    dataIndex: `${month.year}-${month.month}-out`,
                });
            }

            // 生成数据
            let { inboundChanges, outboundChanges } = stockChanges;
            let datas: Array<any> = [];
            for (let product of products) {
                let data: any = {};
                data.sku = product.sku;
                data.name = product.name;
                for (let month of [...months].reverse()) {
                    // 产品这个月的入库库存
                    let monthInboundQuantity = inboundChanges.find((e: any) => e.year == month.year && e.month == month.month && e.sku == product.sku)?.total || 0;
                    // 产品这个月的出库库存
                    let monthOutboundQuantity = outboundChanges.find((e: any) => e.year == month.year && e.month == month.month && e.sku == product.sku)?.total || 0;

                    data[`${month.year}-${month.month}-in`] = monthInboundQuantity;
                    data[`${month.year}-${month.month}-out`] = monthOutboundQuantity;
                }
                datas.push(data);
            }
            this.setState({ datas: datas, months: months });
        });
    }

    exportFile = () => {
        let head: any = {};
        head.sku = "SKU";
        head.name = "名称";
        for (let month of this.state.months) {
            head[`${month.year}-${month.month}-in`] = `${month.year}-${month.month}-入`;
            head[`${month.year}-${month.month}-out`] = `${month.year}-${month.month}-出`;
        }
        exportXLSX([head, ...this.state.datas], undefined, "库存变化.xlsx");
    }

    render(): React.ReactNode {
        return <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <Typography.Paragraph style={{ marginBottom: 0 }} type='warning'>注：各个月的库存是通过当前库存与各个月的出入数量作计算得出，该数值并不一定是精确的（如：你有进行过无单上下架操作或者进行库存盘点操作，这会影响该数值的计算）</Typography.Paragraph>
                <Button type='primary' onClick={this.exportFile}>导出</Button>
            </div>
            <Table
                style={{ width: '100%' }}
                scroll={{
                    x: 5000
                }}
                columns={this.configs}
                dataSource={this.state.datas}
                pagination={false}
            />
        </div>
    }
}

export default () => {
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    return <StockChange warehouseId={warehouseId} />
}