import Api, { FilterValueType } from '../Api';
import { PurchaseReturnOrderEntity } from '../Types';
import { iceFetch } from 'ice-common';

class ApiEx extends Api<PurchaseReturnOrderEntity> {
    url = '/api/psi/purchase-return-order';

    async invalid(id: string) {
        return await iceFetch(`/api/psi/purchase-return-order/${id}/invalid`, {
            method: 'PUT'
        })
    }

    async toReturning(id: string) {
        return await iceFetch(`/api/psi/purchase-return-order/${id}/to-returning`, {
            method: 'PUT'
        })
    }

    async toFinish(id: string) {
        return await iceFetch(`/api/psi/purchase-return-order/${id}/to-finish`, {
            method: 'PUT'
        })
    }

    async settlement(id: string) {
        return await iceFetch(`/api/psi/purchase-return-order/${id}/settlement`, {
            method: 'PUT'
        })
    }

    async fastHandle(id: string) {
        return await iceFetch(`/api/psi/purchase-return-order/${id}/fast-handle`, {
            method: 'PUT',
            body: JSON.stringify({})
        })
    }

    async setPaymentMethod(params: {
        id: string,
        paymentMethodId: string | null,
    }) {
        return await iceFetch(`/api/psi/purchase-return-order/${params.id}/set-payment-method`, {
            method: 'PUT',
            body: JSON.stringify({
                paymentMethodId: params.paymentMethodId
            })
        })
    }
}

export default new ApiEx();