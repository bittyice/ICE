import Api, { FilterValueType } from '../Api';
import { PurchaseOrderEntity } from '../Types';
import { iceFetch } from 'ice-common';

class ApiEx extends Api<PurchaseOrderEntity> {
    url = '/api/psi/purchase-order';

    async invalid(id: string) {
        return await iceFetch(`/api/psi/purchase-order/${id}/invalid`, {
            method: 'PUT'
        })
    }

    async toPurchasing(id: string) {
        return await iceFetch(`/api/psi/purchase-order/${id}/to-purchasing`, {
            method: 'PUT'
        })
    }

    async toFinish(id: string) {
        return await iceFetch(`/api/psi/purchase-order/${id}/to-finish`, {
            method: 'PUT'
        })
    }

    async settlement(id: string) {
        return await iceFetch(`/api/psi/purchase-order/${id}/settlement`, {
            method: 'PUT'
        })
    }

    async fastHandle(id: string) {
        return await iceFetch(`/api/psi/purchase-order/${id}/fast-handle`, {
            method: 'PUT',
            body: JSON.stringify({})
        })
    }

    async setPricePaid(params: {
        id: string,
        pricePaid: number
    }) {
        return await iceFetch(`/api/psi/purchase-order/${params.id}/set-price-paid`, {
            method: 'PUT',
            body: JSON.stringify({
                pricePaid: params.pricePaid
            })
        })
    }

    async setPaymentMethod(params: {
        id: string,
        paymentMethodId: string | null,
    }) {
        return await iceFetch(`/api/psi/purchase-order/${params.id}/set-payment-method`, {
            method: 'PUT',
            body: JSON.stringify({
                paymentMethodId: params.paymentMethodId
            })
        })
    }
}

export default new ApiEx();