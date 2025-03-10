import React, { useState, useRef } from 'react';
import { Col, Row, Space, Button, Modal, Typography, message, notification } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import {
    PrintDatas,
} from 'ice-layout';
import { Edit, Add } from './Edit';
import { enums, WarehouseEntity, consts, OutboundOrderApi, OutboundOrderEntity, Delivery100Api, TenantEntity } from 'ice-core';
import DeliverySelectModal from '../../components/DeliverySelectModal';

export { default as Review } from './Review';


export default class extends React.Component<{
    tenant: TenantEntity,
    selectRows: Array<OutboundOrderEntity>,
    warehouse: WarehouseEntity,
    onOk: () => void,
}> {
    notificationKey = 'outbound';
    printExpressOrderRef: PrintDatas | null = null;

    state = {
        // 使用的快递服务
        useDelivery: null as any,
        // 显示选择快递服务模态
        showDeliveryService: false,
        // 要打印的电子面单html
        expressOrderTemplates: [] as Array<string>,
        // 打印快递面单
        printExpressOrderKey: 0
    }

    // 打单
    fetchExpressOrder = async () => {
        let printTemplates: Array<string> = [];
        for (let outboundOrder of this.props.selectRows) {
            let orderWithDetails = await OutboundOrderApi.get(outboundOrder.id!);
            // 获取电子面单
            try {
                var expressOrder = await Delivery100Api.getExpressOrder(orderWithDetails, this.props.warehouse, this.state.useDelivery);
                // 获取面单成功
                if (expressOrder) {
                    printTemplates.push(expressOrder.printTemplate!);
                }
            } catch (ex) {
                notification.error({
                    message: `获取出库单 ${outboundOrder.outboundNumber} 面单失败`,
                    description: ex.responseData?.error?.message,
                    duration: null
                });
            }
        }

        this.setState({ expressOrderTemplates: printTemplates });
    }

    // 取消面单
    fetchLabelCancel = async (row: any) => {
        Modal.confirm({
            title: '取消面单',
            content: '确认取消面单吗？',
            onOk: async () => {
                await Delivery100Api.cancelExpressOrder(row);
            }
        });
    }

    render(): React.ReactNode {
        return <>
            <Button type='link' ghost icon={<PrinterOutlined />}
                onClick={() => {
                    if (this.props.tenant.amount < 0) {
                        message.warning("请确保你的账号有余额，才能进行面单打印");
                        return;
                    }

                    if (this.props.selectRows.length == 0) {
                        message.warning("请选择打印的出库单");
                        return;
                    }

                    if (this.props.selectRows.some(e => e.status != enums.OutboundOrderStatus.TobeOut && e.status != enums.OutboundOrderStatus.Outofstock)) {
                        message.warning("只有待出库和已出库的订单才能打印面单");
                        return;
                    }

                    this.setState({ showDeliveryService: true });
                }}
            >打印面单</Button>
            <DeliverySelectModal
                open={this.state.showDeliveryService}
                onCancel={() => {
                    this.setState({ showDeliveryService: false });
                }}
                onOk={(delivery: any) => {
                    this.setState({ useDelivery: delivery, showDeliveryService: false }, () => {
                        notification.info({
                            key: this.notificationKey,
                            message: '正在请求面单...',
                            description: '正在请求面单中，请不要关闭当前页面',
                            duration: null
                        });
                        this.fetchExpressOrder().then(() => {
                            this.setState({ printExpressOrderKey: this.state.printExpressOrderKey + 1 });
                            setTimeout(() => {
                                this.printExpressOrderRef?.print();
                            }, 10);
                        }).finally(() => {
                            notification.destroy(this.notificationKey);
                            this.props.onOk();
                        });
                    });
                }}
            />
            {
                this.state.printExpressOrderKey > 0 &&
                <PrintDatas
                    key={this.state.printExpressOrderKey}
                    ref={r => this.printExpressOrderRef = r}
                    printDatas={this.state.expressOrderTemplates.map(item => <img style={{ width: '100%' }} src={item} />)}
                />
            }
        </>
    }
}