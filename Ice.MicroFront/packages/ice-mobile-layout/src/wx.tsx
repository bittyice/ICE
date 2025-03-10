import { iceFetch } from 'ice-common';

class Wx {
    appId = "wx39a55e2a966358fb";
    wx = (window as any).wx;

    config() {
        let timestamp = new Date().getTime();
        let nonceStr = this._randomString(16);

        iceFetch<any>('/api/WxService/CreateJSApiSignature',{
            method: 'GET',
            urlParams: {
                nonceStr: nonceStr,
                timestamp: timestamp,
                url: window.location.href
            }
        }).then(data => {
            this.wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: this.appId, // 必填，公众号的唯一标识
                timestamp: timestamp, // 必填，生成签名的时间戳
                nonceStr: nonceStr, // 必填，生成签名的随机串
                signature: data,// 必填，签名
                jsApiList: [
                    // 微信支付
                    'chooseWXPay',
                    // 分享给朋友
                    'updateAppMessageShareData',
                    // 分享到朋友圈
                    'updateTimelineShareData'
                ] // 必填，需要使用的JS接口列表
            });
        })
    }

    ready(func: () => void) {
        return this.wx.ready(func);
    }

    getAuthorizeUrl(redirectUri: string) {
        return 'https://open.weixin.qq.com/connect/oauth2/authorize?' +
            `appid=${this.appId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            'response_type=code&' +
            'scope=snsapi_userinfo&' +
            `state=abc#wechat_redirect`;
    }

    private _randomString(length: number) {  
        var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
        a = t.length,
        n = "";
        for (let i = 0; i < length; i++) n += t.charAt(Math.floor(Math.random() * a));
        return n
    }
}

export default new Wx();