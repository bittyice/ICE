import React from 'react';
import { Fetch } from 'ice-core';
import { Card, Button, Tag } from 'antd-mobile';
import {Images} from 'ice-static';
import wx from '../../wx';
import { Storage } from 'ice-common';

const Item = (props: { onPayClick: () => void }) => {
    return <Card
        style={{ marginBottom: 15 }}
        title={'Ice豪华大礼包-测试'}
    >
        <div style={{ display: 'flex' }}>
            <img src={Images.LogoImg} alt="" style={{ width: 72, height: 72, flexShrink: 0 }} />
            <div style={{ marginLeft: 15 }}>
                <p style={{ marginTop: 0 }}>Ice豪华大礼包，你值得拥有，呵呵</p>
                <p style={{ color: '#ababab' }}>发货时间：2099-01-01</p>
                <div>
                    <Tag color='primary'>预售</Tag>
                    <Tag color='primary' style={{ marginLeft: 10 }}>买了就是买了</Tag>
                </div>
            </div>
            <div style={{ marginLeft: 15, flexShrink: 0 }}>
                <div>共1件</div>
                <div>￥ 0.1</div>
            </div>
        </div>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tag color='danger'>待支付</Tag>
            <Button
                size='small'
                onClick={props.onPayClick}
                color='success'
            >去支付</Button>
        </div>
    </Card>
}

export default class Order extends React.Component<{}> {
    state = {
        openid: ''
    }

    componentDidMount() {
        let code;
        let state;

        for (var item of (window.location.search || '').replace('?', '').split('&')) {
            let keyValue = item.split('=');
            if (keyValue.length != 2) {
                continue;
            }

            if (keyValue[0] == 'code') {
                code = keyValue[1];
                continue;
            }

            if (keyValue[0] == 'state') {
                state = keyValue[1];
                continue;
            }
        }

        // 如果code有值，则为刚授权重定向回来，需去后端请求拿到openid
        if (code) {
            console.log('授权码', code);
            Fetch.fetch({
                url: `/api/WxService/GetOpenID`,
                urlParams: {
                    code: code
                }
            }).then(data => {
                if (data) {
                    console.log('openid获取成功', data);
                    Storage.setItem('openid', data);
                    this.setState({ openid: data });
                }
                else {
                    console.log('openid获取失败');
                    Storage.setItem('openid', '');
                }
            });
            return;
        }

        // 如果code没有值，则为刚进入页面，检查缓存是否有保存openid，没有则去授权
        Storage.getItem('openid').then((openid) => {
            if (openid) {
                this.setState({ openid: openid });
                return;
            }

            console.log('跳转微信授权页');
            window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?' +
                `appid=${wx.appId}&` +
                `redirect_uri=${encodeURIComponent(window.location.origin + window.location.pathname)}&` +
                'response_type=code&' +
                'scope=snsapi_userinfo&' +
                'state=123456#wechat_redirect';
        });
    }

    onPayClick = () => {
        if (!this.state.openid) {
            alert('错误：openid为空');
            return;
        }

        Fetch.fetch({
            url: '/api/WxService/PlaceOrder',
            method: 'POST',
            body: {
                openID: this.state.openid,
                productID: 2
            }
        }).then(data => {
            if (!data) {
                console.log('微信下单失败');
                return;
            }

            console.log('微信下单成功', data);
            //@ts-ignore
            window.WeixinJSBridge.invoke('getBrandWCPayRequest', {
                //公众号ID，由商户传入   
                "appId": wx.appId,
                //时间戳，自1970年以来的秒数
                "timeStamp": data.timeStamp,
                //随机串
                "nonceStr": data.nonceStr,
                //预支付会话标识
                "package": data.package,
                //微信签名方式   
                "signType": "RSA",
                //微信签名 
                "paySign": data.paySign
            }, function (res: any) {
                if (res.err_msg == "get_brand_wcpay_request:ok") {
                    console.log('支付成功');
                    alert('支付成功了，但是你什么都没有得到');
                }
                else {
                    console.log('支付失败');
                }
            });
        }).catch(() => {
            console.log('微信下单失败');
        });
    }

    render() {
        return <div style={{ padding: 15 }}>
            <Item onPayClick={this.onPayClick} />
            <Item onPayClick={this.onPayClick} />
            <Item onPayClick={this.onPayClick} />
            <Item onPayClick={this.onPayClick} />
        </div>
    }
}