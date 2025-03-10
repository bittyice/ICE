import Api, { FilterValueType } from '../Api';
import { SaleDetailEntity, SaleOrderEntity } from '../Types';
import { iceFetch } from 'ice-common';

class ApiEx extends Api<SaleOrderEntity> {
    url = '/api/psi/sale-order';

    async getListForOrderNumbers(params: {
        orderNumbers: Array<string>
    }) {
        return await iceFetch<Array<SaleOrderEntity>>('/api/psi/sale-order/for-order-numbers', {
            method: 'GET',
            urlParams: params
        });
    }

    async confirm(props: {
        id: string,
        totalPrice: number
    }) {
        return await iceFetch(`/api/psi/sale-order/${props.id}/confirm`, {
            method: 'POST',
            body: JSON.stringify({
                totalPrice: props.totalPrice
            })
        })
    }

    async unconfirm(id: string) {
        return await iceFetch(`/api/psi/sale-order/${id}/unconfirm`, {
            method: 'POST'
        })
    }

    async processing(id: string) {
        return await iceFetch(`/api/psi/sale-order/${id}/processing`, {
            method: 'POST'
        })
    }

    async completed(id: string) {
        return await iceFetch(`/api/psi/sale-order/${id}/completed`, {
            method: 'POST'
        })
    }

    async settlement(id: string) {
        return await iceFetch(`/api/psi/sale-order/${id}/settlement`, {
            method: 'POST'
        })
    }

    async reject(params: {
        id: string,
        rejectReason: string | undefined,
    }) {
        return await iceFetch(`/api/psi/sale-order/${params.id}/reject`, {
            method: 'POST',
            body: JSON.stringify({
                rejectReason: params.rejectReason
            })
        })
    }

    async setTotalPricePaid(params: {
        id: string,
        totalPricePaid: number,
    }) {
        return await iceFetch(`/api/psi/sale-order/${params.id}/set-total-price-paid`, {
            method: 'PUT',
            body: JSON.stringify({
                totalPricePaid: params.totalPricePaid
            })
        })
    }

    async fastHandle(params: {
        id: string,
        totalPrice: number
    }) {
        return await iceFetch(`/api/psi/sale-order/${params.id}/fast-handle`, {
            method: 'POST',
            body: JSON.stringify({
                totalPrice: params.totalPrice
            })
        })
    }

    async getLateBusinessQuotes(params: {
        businessName: string,
        skus: Array<string>
    }) {
        return await iceFetch<Array<SaleDetailEntity>>(`/api/psi/sale-order/late-business-quotes`, {
            method: 'GET',
            urlParams: params
        })
    }

    async setPaymentMethod(params: {
        id: string,
        paymentMethodId: string | null,
    }) {
        return await iceFetch(`/api/psi/sale-order/${params.id}/set-payment-method`, {
            method: 'PUT',
            body: JSON.stringify({
                paymentMethodId: params.paymentMethodId
            })
        })
    }
}

export default new ApiEx();