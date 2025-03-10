import React, { useEffect, useState } from 'react';
import { Typography, notification, Divider, Row, Col, Select, DatePicker, Tag, Table, Button, Space, Input, InputNumber, Modal, message, Cascader } from 'antd';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';
import { LabelEX, OpenNewKey } from 'ice-layout';
import { OutboundOrderApi, InboundOrderApi, OutboundOrderEntity, WarehouseEntity, IceStateType, warehouseSlice, PurchaseOrderEntity, PurchaseOrderApi, InboundOrderEntity, enums, SaleReturnOrderEntity, SaleReturnOrderApi, SaleOrderEntity, SaleOrderApi } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { token } from 'ice-common';

class PushInbound extends React.Component<{
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
    orders: Array<InboundOrderEntity>,
    warehouses: Array<WarehouseEntity>,
}> {
    state = {
        loading: false,
        warehouseId: null
    };

    fetchProcess = async () => {
        notification.info({
            message: '正在处理中...',
            description: '正在处理中，请不要关闭窗口',
            duration: null
        });

        for (let order of this.props.orders) {
            await InboundOrderApi.create({
                ...order,
                warehouseId: this.state.warehouseId!
            }).catch((ex) => {
                notification.error({
                    message: `订单 ${order.inboundNumber} 处理时出错`,
                    description: ex.responseData?.error?.message,
                    duration: null,
                })
            });
        }

        notification.success({
            message: '已处理完成',
            description: '订单已推送完成',
            duration: null
        });
        this.props.onOk();
    }

    render() {
        return <Modal
            title='推送订单'
            open={this.props.open}
            confirmLoading={this.state.loading}
            maskClosable={false}
            width={350}
            onCancel={this.props.onCancel}
            onOk={() => {
                if (!this.state.warehouseId) {
                    message.error('请选择仓库');
                    return;
                }

                this.setState({ loading: true });
                this.fetchProcess().finally(() => {
                    this.setState({ loading: false });
                });
            }}
        >
            <div>
                <LabelEX isMust text={'推送仓库'} style={{ width: '100%' }}>
                    <Select
                        placeholder='推送仓库'
                        style={{ width: '100%' }}
                        value={this.state.warehouseId}
                        onChange={val => {
                            this.state.warehouseId = val;
                            this.setState({});
                        }}
                    >
                        {
                            this.props.warehouses.map(item => (<Select.Option value={item.id}>{item.name}</Select.Option>))
                        }
                    </Select>
                </LabelEX>
                <Typography style={{ marginTop: 15 }}>
                    <Typography.Text type='warning'>
                        你已经选择了 {this.props.orders.length} 条订单，推送后将会在仓库生成对应的订单!
                    </Typography.Text>
                </Typography>
            </div>
        </Modal>
    }
}

const PushInboundEx = (props: {
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
    orders: Array<InboundOrderEntity>,
}) => {
    const dispatch = useDispatch();
    let warehouses = useSelector((state: IceStateType) => state.warehouse.allDatas) || [];

    useEffect(() => {
        dispatch(warehouseSlice.asyncActions.fetchAllDatas({}) as any);
    }, []);

    return <PushInbound
        {...props}
        warehouses={warehouses}
    />
}

const PurchaseToInbound = (props: {
    orders: Array<PurchaseOrderEntity>
}) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [pushOrders, setPushOrders] = useState<Array<InboundOrderEntity>>([]);
    const suppliers = useSelector((state: IceStateType) => state.supplier.allDatas) || [];

    const fetchOrders = async () => {
        if (props.orders.length == 0) {
            message.error('请选择订单');
            return;
        }

        let pushOrders: Array<InboundOrderEntity> = [];
        for (let order of props.orders) {
            let purchaseOrder = await PurchaseOrderApi.get(order.id!);
            pushOrders.push({
                inboundNumber: purchaseOrder.orderNumber,
                type: enums.InboundOrderType.Purchase,
                warehouseId: undefined,
                otherInfo: `供应商：${suppliers.find(e => e.id == order.supplierId)?.name}`,
                inboundDetails: purchaseOrder.details?.map((e) => ({
                    sku: e.sku,
                    forecastQuantity: e.quantity! + e.giveQuantity!,
                    remark: e.remark
                }))
            })
        }
        setPushOrders(pushOrders);
        setShow(true);
    }

    useEffect(() => {
        setHasPermission(token.userInfo.scope?.some(e => e == enums.IceResourceScopes.WMSScope) == true);
    }, []);

    if (!hasPermission) {
        return <></>;
    }

    return <>
        <Button
            type='link'
            loading={loading}
            onClick={() => {
                setLoading(true);
                fetchOrders().finally(() => {
                    setLoading(false);
                });
            }}
        >订单推送到仓库</Button>
        <PushInboundEx
            open={show}
            onCancel={() => setShow(false)}
            onOk={() => setShow(false)}
            orders={pushOrders}
        />
    </>
}

const SaleReturnToInbound = (props: {
    orders: Array<SaleReturnOrderEntity>
}) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [pushOrders, setPushOrders] = useState<Array<InboundOrderEntity>>([]);

    const fetchOrders = async () => {
        if (props.orders.length == 0) {
            message.error('请选择订单');
            return;
        }

        let pushOrders: Array<InboundOrderEntity> = [];
        for (let order of props.orders) {
            let saleReturnOrder = await SaleReturnOrderApi.get(order.id!);
            pushOrders.push({
                inboundNumber: saleReturnOrder.orderNumber,
                type: enums.InboundOrderType.SaleReturn,
                warehouseId: undefined,
                otherInfo: `客户：${saleReturnOrder.businessName}`,
                inboundDetails: saleReturnOrder.details?.map((e) => ({
                    sku: e.sku,
                    forecastQuantity: e.quantity,
                }))
            })
        }
        setPushOrders(pushOrders);
        setShow(true);
    }

    useEffect(() => {
        setHasPermission(token.userInfo.scope?.some(e => e == enums.IceResourceScopes.WMSScope) == true);
    }, []);

    if (!hasPermission) {
        return <></>;
    }

    return <>
        <Button
            type='link'
            loading={loading}
            onClick={() => {
                setLoading(true);
                fetchOrders().finally(() => {
                    setLoading(false);
                });
            }}
        >订单推送到仓库</Button>
        <PushInboundEx
            open={show}
            onCancel={() => setShow(false)}
            onOk={() => setShow(false)}
            orders={pushOrders}
        />
    </>
}

class PushOutbound extends React.Component<{
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
    orders: Array<OutboundOrderEntity>,
    warehouses: Array<WarehouseEntity>,
}> {
    state = {
        loading: false,
        warehouseId: null
    };

    fetchProcess = async () => {
        notification.info({
            message: '正在处理中...',
            description: '正在处理中，请不要关闭窗口',
            duration: null
        });

        for (let order of this.props.orders) {
            await OutboundOrderApi.create({
                ...order,
                warehouseId: this.state.warehouseId!
            }).catch((ex) => {
                notification.error({
                    message: `订单 ${order.outboundNumber} 处理时出错`,
                    description: ex.responseData?.error?.message,
                    duration: null,
                })
            });
        }

        notification.success({
            message: '已处理完成',
            description: '订单已推送完成',
            duration: null
        });
        this.props.onOk();
    }

    render() {
        return <Modal
            title='推送订单'
            open={this.props.open}
            confirmLoading={this.state.loading}
            maskClosable={false}
            width={350}
            onCancel={this.props.onCancel}
            onOk={() => {
                if (!this.state.warehouseId) {
                    message.error('请选择仓库');
                    return;
                }

                this.setState({ loading: true });
                this.fetchProcess().finally(() => {
                    this.setState({ loading: false });
                });
            }}
        >
            <div>
                <LabelEX isMust text={'推送仓库'} style={{ width: '100%' }}>
                    <Select
                        placeholder='推送仓库'
                        style={{ width: '100%' }}
                        value={this.state.warehouseId}
                        onChange={val => {
                            this.state.warehouseId = val;
                            this.setState({});
                        }}
                    >
                        {
                            this.props.warehouses.map(item => (<Select.Option value={item.id}>{item.name}</Select.Option>))
                        }
                    </Select>
                </LabelEX>
                <Typography style={{ marginTop: 15 }}>
                    <Typography.Text type='warning'>
                        你已经选择了 {this.props.orders.length} 条订单，推送后将会在仓库生成对应的订单!
                    </Typography.Text>
                </Typography>
            </div>
        </Modal>
    }
}

const PushOutboundEx = (props: {
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
    orders: Array<OutboundOrderEntity>,
}) => {
    const dispatch = useDispatch();
    let warehouses = useSelector((state: IceStateType) => state.warehouse.allDatas) || [];

    useEffect(() => {
        dispatch(warehouseSlice.asyncActions.fetchAllDatas({}) as any);
    }, []);

    return <PushOutbound
        {...props}
        warehouses={warehouses}
    />
}

const SaleToOutbound = (props: {
    orders: Array<SaleOrderEntity>
}) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [pushOrders, setPushOrders] = useState<Array<OutboundOrderEntity>>([]);

    const fetchOrders = async () => {
        if (props.orders.length == 0) {
            message.error('请选择订单');
            return;
        }

        let pushOrders: Array<OutboundOrderEntity> = [];
        for (let order of props.orders) {
            let saleOrder = await SaleOrderApi.get(order.id!);
            pushOrders.push({
                outboundNumber: saleOrder.orderNumber,
                orderType: enums.OutboundOrderType.Sale,
                recvContact: saleOrder.recvInfo?.contact,
                recvContactNumber: saleOrder.recvInfo?.contactNumber,
                recvProvince: saleOrder.recvInfo?.province,
                recvCity: saleOrder.recvInfo?.city,
                recvTown: saleOrder.recvInfo?.town,
                recvStreet: saleOrder.recvInfo?.street,
                recvAddressDetail: saleOrder.recvInfo?.addressDetail,
                recvPostcode: saleOrder.recvInfo?.postcode,
                warehouseId: undefined,
                otherInfo: `客户：${saleOrder.recvInfo?.businessName}`,
                remark: saleOrder.remark,
                outboundDetails: saleOrder.details?.map((e) => ({
                    sku: e.sku,
                    quantity: e.quantity! + e.giveQuantity!,
                }))
            })
        }
        setPushOrders(pushOrders);
        setShow(true);
    }

    useEffect(() => {
        setHasPermission(token.userInfo.scope?.some(e => e == enums.IceResourceScopes.WMSScope) == true);
    }, []);

    if (!hasPermission) {
        return <></>;
    }

    return <>
        <Button
            type='link'
            loading={loading}
            onClick={() => {
                setLoading(true);
                fetchOrders().finally(() => {
                    setLoading(false);
                });
            }}
        >订单推送到仓库</Button>
        <PushOutboundEx
            open={show}
            onCancel={() => setShow(false)}
            onOk={() => setShow(false)}
            orders={pushOrders}
        />
    </>
}

export {
    PurchaseToInbound,
    SaleReturnToInbound,
    SaleToOutbound
}