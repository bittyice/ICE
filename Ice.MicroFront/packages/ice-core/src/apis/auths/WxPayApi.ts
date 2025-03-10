import Api from '../Api';
import { CompanyEntity, TenantEntity } from '../Types';
import { iceFetch } from 'ice-common';

class WxPay {
    async closeOrder(params: {
        orderNumber: string
    }) {
        return await iceFetch('/api/auth/wx-pay/close-order', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    async recharge(params: {
        price: number
    }) {
        return await iceFetch<any>('/api/auth/wx-pay/recharge', {
            method: 'POST',
            body: JSON.stringify({
                price: params.price * 100
            })
        }).then(data => {
            if (data) {
                data.price = data.price / 100;
            }
            return data;
        });
    }

    async checkPayStatus(params: {
        orderNumber: string
    }) {
        return await iceFetch<boolean>('/api/auth/wx-pay/check-pay-status', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }
}

export default new WxPay();