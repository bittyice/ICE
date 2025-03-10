import Api from '../Api';
import { CompanyEntity, TenantEntity } from '../Types';
import { iceFetch } from 'ice-common';

class ZfbPayApi {
    async closeOrder(params: {
        orderNumber: string
    }) {
        return await iceFetch('/api/auth/zfb-pay/close-order', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    async recharge(params: {
        price: number
    }) {
        return await iceFetch<any>('/api/auth/zfb-pay/recharge', {
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
        return await iceFetch<boolean>('/api/auth/zfb-pay/check-pay-status', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }
}

export default new ZfbPayApi();