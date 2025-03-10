import Api, { FilterValueType } from '../Api';
import { SaleReturnOrderEntity } from '../Types';
import { iceFetch } from 'ice-common';

class ApiEx extends Api<SaleReturnOrderEntity> {
    url = '/api/psi/sale-return-order';

    async getListForIds(params: {
        ids: Array<string>
    }) {
        return await iceFetch<Array<SaleReturnOrderEntity>>(`/api/psi/sale-return-order/for-ids`, {
            method: 'GET',
            urlParams: params
        })
    }

    async confirm(params: {
        id: string,
        totalPrice: number
    }) {
        return await iceFetch(`/api/psi/sale-return-order/${params.id}/confirm`, {
            method: 'POST',
            body: JSON.stringify({
                totalPrice: params.totalPrice
            })
        })
    }

    async unconfirm(id: string) {
        return await iceFetch(`/api/psi/sale-return-order/${id}/unconfirm`, {
            method: 'POST',
            body: JSON.stringify({
            })
        })
    }

    async processed(id: string) {
        return await iceFetch(`/api/psi/sale-return-order/${id}/processed`, {
            method: 'POST',
            body: JSON.stringify({
            })
        })
    }

    async completed(id: string) {
        return await iceFetch(`/api/psi/sale-return-order/${id}/completed`, {
            method: 'POST',
            body: JSON.stringify({
            })
        })
    }

    async settlement(id: string) {
        return await iceFetch(`/api/psi/sale-return-order/${id}/settlement`, {
            method: 'POST',
            body: JSON.stringify({
            })
        })
    }

    async rejected(params: {
        id: string,
        rejectReason: string | undefined
    }) {
        return await iceFetch(`/api/psi/sale-return-order/${params.id}/rejected`, {
            method: 'POST',
            body: JSON.stringify({
                rejectReason: params.rejectReason
            })
        })
    }

    async fastHandle(params: {
        id: string,
        totalPrice: number
    }) {
        return await iceFetch(`/api/psi/sale-return-order/${params.id}/fast-handle`, {
            method: 'POST',
            body: JSON.stringify({
                totalPrice: params.totalPrice
            })
        })
    }

    async setPaymentMethod(params: {
        id: string,
        paymentMethodId: string | null,
    }) {
        return await iceFetch(`/api/psi/sale-return-order/${params.id}/set-payment-method`, {
            method: 'PUT',
            body: JSON.stringify({
                paymentMethodId: params.paymentMethodId
            })
        })
    }
}

export default new ApiEx();