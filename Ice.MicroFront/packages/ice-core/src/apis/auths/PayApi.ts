import { iceFetch } from 'ice-common';

class Pay {
    async isPaid(params: {
        orderNumber: string
    }) {
        return await iceFetch<boolean>('/api/auth/pay/is-paid', {
            urlParams: params
        });
    }

    async getPendingPayOrder() {
        return await iceFetch<any>('/api/auth/pay/pending-pay-order', {
            method: 'GET',
        }).then(data => {
            if (data) {
                data.price = data.price / 100;
            }
            return data;
        });
    }
}

export default new Pay();