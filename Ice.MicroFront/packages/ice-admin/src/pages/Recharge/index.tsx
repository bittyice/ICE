import React from 'react';
import { InputNumber, Typography, Button, Tabs, message, Modal, notification, QRCode, Radio } from 'antd';
import { WechatFilled, AlipayOutlined, CheckOutlined } from '@ant-design/icons';
import { iceFetch, Tool } from 'ice-common';
import { IceStateType, WxPayApi, ZfbPayApi, PayApi, globalSlice } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import './index.css';
// @ts-ignore
import PayImg from './Pay.svg';

class Recharge extends React.Component<{
    refreshPage: () => void
}> {
    state = {
        pendingPayOrder: null as any,
        price: 100,
        payType: 'wx' as 'wx' | 'zfb'
    }

    constructor(props: any) {
        super(props);
        let amount = Tool.getUrlVariable(window.location.search, 'amount');
        if (amount) {
            try {
                this.state.price = parseFloat(amount);
            } catch { }
        }
    }

    componentDidMount(): void {
        this.fetchPendingPayOrder();
        this.fetchIsPaidH = setInterval(this.fetchIsPaid, 7000);
    }

    componentWillUnmount(): void {
        if (this.autoClearQRH) {
            clearTimeout(this.autoClearQRH);
        }

        if (this.fetchIsPaidH) {
            clearInterval(this.fetchIsPaidH);
        }
    }

    // 请求待支付的订单
    fetchPendingPayOrder() {
        return PayApi.getPendingPayOrder()
            .then(data => {
                this.setState({ pendingPayOrder: data });
                if (data) {
                    this.setState({ payType: data.type });
                    this.autoClearQR(data);
                }
            });
    }

    // 下单
    fetchRecharge() {
        if (this.state.payType == 'wx') {
            return WxPayApi.recharge({
                price: this.state.price
            }).then((data) => {
                message.success('下单成功，请扫描右边的二维码进行充值');
                this.setState({ pendingPayOrder: data });
                this.autoClearQR(data);
            });
        }
        else if (this.state.payType == 'zfb') {
            return ZfbPayApi.recharge({
                price: this.state.price
            }).then((data) => {
                message.success('下单成功，请扫描右边的二维码进行充值');
                this.setState({ pendingPayOrder: data });
            });
        }
    }

    // 充值点击
    onRecharge = () => {
        if (!this.state.price) {
            message.warning('请输入充值金额');
            return;
        }

        Modal.confirm({
            title: '充值提醒',
            content: `请确认充值金额 ${this.state.price} ￥，付款方式 ${this.state.payType == 'wx' ? '微信' : '支付宝'}`,
            onOk: () => {
                this.fetchRecharge();
            }
        });
    }

    // 取消订单
    fetchCloseOrder = () => {
        Modal.confirm({
            title: '取消订单',
            content: `你确认取消该订单吗？`,
            onOk: () => {
                if (this.state.payType == 'wx') {
                    return WxPayApi.closeOrder({
                        orderNumber: this.state.pendingPayOrder.orderNumber
                    }).then(() => {
                        message.success('成功取消订单');
                        this.setState({ pendingPayOrder: null });
                    });
                }
                else if (this.state.payType == 'zfb') {
                    return ZfbPayApi.closeOrder({
                        orderNumber: this.state.pendingPayOrder.orderNumber
                    }).then(() => {
                        message.success('成功取消订单');
                        this.setState({ pendingPayOrder: null });
                    });
                }
            }
        });
    }

    // 查询订单是否已支付
    fetchIsPaidH = null as any;
    fetchIsPaid = () => {
        if (!this.state.pendingPayOrder) {
            return;
        }

        return PayApi.isPaid({
            orderNumber: this.state.pendingPayOrder.orderNumber
        }).then((isPaid: boolean) => {
            if (isPaid == true) {
                notification.success({
                    message: '充值成功',
                    description: `你已成功充值 ${this.state.pendingPayOrder.price} ￥`,
                    duration: null,
                });
                this.setState({ pendingPayOrder: null });
                this.props.refreshPage();
            }
        });
    }

    autoClearQRH = null as any;
    autoClearQR = (payOrder: any) => {
        if (this.autoClearQRH) {
            clearTimeout(this.autoClearQRH);
        }
        let now = new Date().getTime();
        let effectiveTime = new Date(payOrder.effectiveTime).getTime();
        let time = effectiveTime - now;
        setTimeout(() => {
            this.setState({ pendingPayOrder: null });
        }, time)
    }

    fetchCheckPayStatus = () => {
        if (this.state.payType == 'wx') {
            return WxPayApi.checkPayStatus({
                orderNumber: this.state.pendingPayOrder.orderNumber
            }).then((isPaid: boolean) => {
                if (isPaid == true) {
                    notification.success({
                        message: '充值成功！',
                        description: `你已成功充值 ${this.state.pendingPayOrder.price} ￥`,
                        duration: null,
                    });
                    this.setState({ pendingPayOrder: null });
                    this.props.refreshPage();
                }
                else {
                    notification.warning({
                        message: '订单未支付！',
                        description: `我们查询了微信的结果显示订单未支付，如果你确实已支付，请联系管理学员！`,
                        duration: null,
                    });
                }
            });
        }
        else if (this.state.payType == 'zfb') {
            return ZfbPayApi.checkPayStatus({
                orderNumber: this.state.pendingPayOrder.orderNumber
            }).then((isPaid: boolean) => {
                if (isPaid == true) {
                    notification.success({
                        message: '充值成功！',
                        description: `你已成功充值 ${this.state.pendingPayOrder.price} ￥`,
                        duration: null,
                    });
                    this.setState({ pendingPayOrder: null });
                    this.props.refreshPage();
                }
                else {
                    notification.warning({
                        message: '订单未支付！',
                        description: `我们查询了支付宝的结果显示订单未支付，如果你确实已支付，请联系管理学员！`,
                        duration: null,
                    });
                }
            });
        }
    }

    wxPayComponent = () => {
        return <div className='flex'>
            <div className='flex flex-col gap-4 border border-solid border-gray-100 p-6 rounded-md w-7/12 items-center'>
                <div>
                    <CheckOutlined />
                    <span className='ml-4 font-semibold text-lg'>待支付订单，金额 {this.state.pendingPayOrder?.price} ￥，请尽快完成支付</span>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 170,
                    height: 170,
                    border: '1px solid #f0f2f5',
                }}>
                    {this.state.pendingPayOrder ? <QRCode className='w-full h-full' value={this.state.pendingPayOrder?.payUrl || '-'} /> : '----'}
                </div>
                <div>请使用微信扫描上方二维码</div>
                <div>订单过期时间：{Tool.dateFormat(this.state.pendingPayOrder?.effectiveTime)}，请在该时间内完成支付</div>
            </div>
            <div className='w-5/12'>
                <img style={{ width: '100%' }} src={PayImg} alt="" />
            </div>
        </div>
    }

    zfbPayComponent = () => {
        return <div className='flex'>
            <div className='flex flex-col gap-4 border border-solid border-gray-100 p-6 rounded-md w-7/12 items-center'>
                <div>
                    <CheckOutlined />
                    <span className='ml-4 font-semibold text-lg'>待支付订单，金额 {this.state.pendingPayOrder?.price} ￥，请尽快完成支付</span>
                </div>
                <div
                    style={{
                        width: 170,
                        height: 170,
                        border: '1px solid #f0f2f5',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {
                        this.state.pendingPayOrder ?
                            <iframe
                                style={{
                                    width: 155,
                                    height: 155,
                                    border: 0,
                                    overflow: 'hidden'
                                }}
                                srcDoc={this.state.pendingPayOrder?.payUrl}
                            ></iframe>
                            : '----'
                    }
                </div>
                <div>请使用支付宝扫描上方二维码</div>
                <div>订单过期时间：{Tool.dateFormat(this.state.pendingPayOrder?.effectiveTime)}，请在该时间内完成支付</div>
            </div>
            <div className='w-5/12'>
                <img style={{ width: '100%' }} src={PayImg} alt="" />
            </div>
        </div>
    }

    render(): React.ReactNode {
        return <div className='recharge items-start'>
            <div className='rounded-md'>
                <div className='text-xl font-semibold mb-4'>请输入充值金额</div>
                <InputNumber
                    placeholder='请输入充值金额'
                    size='large'
                    style={{ width: '100%' }}
                    min={0.1}
                    max={10000}
                    precision={1}
                    value={this.state.price}
                    onChange={val => {
                        this.setState({ price: val });
                    }}
                />
                <Typography.Paragraph type='secondary' style={{ marginTop: 10 }}>最低充值金额为0.1，最大充值金额为10,000。</Typography.Paragraph>
                <Typography.Paragraph style={{ marginTop: 15 }} type='secondary'>1. 输入充值金额</Typography.Paragraph>
                <Typography.Paragraph type='secondary'>2. 点击充值按钮</Typography.Paragraph>
                <Typography.Paragraph type='secondary'>3. 描右边的二维码进行充值</Typography.Paragraph>
            </div>
            <div>
                <div className='mb-4'>
                    {
                        this.state.payType === 'wx' ?
                            this.wxPayComponent() :
                            this.zfbPayComponent()
                    }
                </div>
                <div>
                    <div className='mb-6 font-semibold text-lg'>请选择你的支付方式</div>
                    <Radio.Group
                        value={this.state.payType}
                        onChange={e => {
                            if (this.state.pendingPayOrder) {
                                message.error('请先取消当前订单');
                                return;
                            }
                            this.setState({ payType: e.target.value });
                        }}
                    >
                        <Radio
                            className='p-4 border border-solid rounded-md border-gray-300'
                            value='wx'
                        >
                            <div className='text-green-600'>
                                <WechatFilled className='ml-2' />
                                <span className='ml-2'>微信支付</span>
                            </div>
                        </Radio>
                        <Radio
                            className='p-4 border border-solid rounded-md border-gray-300'
                            value='zfb'
                        >
                            <div className='text-blue-600'>
                                <AlipayOutlined className='ml-2' />
                                <span className='ml-2'>支付宝</span>
                            </div>
                        </Radio>
                    </Radio.Group>
                    <div className='mt-6 text-gray-400'>
                        放弃支付请点击"取消订单"按钮，已支付但页面未刷新点击"我已支付"按钮
                    </div>
                    <div className='mt-6 flex gap-4'>
                        <Button className=' w-40' size='large' type='primary'
                            onClick={this.onRecharge}
                            disabled={this.state.pendingPayOrder}>充值</Button>
                        <Button className=' w-40' size='large' type='primary' danger
                            disabled={!this.state.pendingPayOrder}
                            onClick={this.fetchCloseOrder}>取消订单</Button>
                        <Button className=' w-40' size='large' type='primary'
                            disabled={!this.state.pendingPayOrder}
                            onClick={this.fetchCheckPayStatus}>我已支付</Button>
                    </div>
                </div>
            </div>
        </div>
    }
}

export default () => {
    const dispatch = useDispatch();
    return <Recharge
        refreshPage={() => {
            dispatch(globalSlice.actions.refreshLayout());
        }}
    />
}