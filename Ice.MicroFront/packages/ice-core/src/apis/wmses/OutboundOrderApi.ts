import { iceFetch } from 'ice-common';
import Api from '../Api';
import { OutboundOrderEntity } from '../Types';
import WmsBaseApi from './WmsBaseApi';

class ApiEx extends WmsBaseApi<OutboundOrderEntity> {
    url = '/api/wms/outbound';

    async review(id: string) {
        return await iceFetch(`/api/wms/outbound/${id}/review`, {
            method: 'PUT',
        })
    }

    async getListWithDetails(params: {
        ids: Array<string>
    }) {
        return await iceFetch<Array<OutboundOrderEntity>>('/api/wms/outbound/with-details', {
            method: 'GET',
            urlParams: params
        })
    }

    async fastPick(params: {
        id: string,
        locationCode: string,
    }) {
        return await iceFetch(`/api/wms/outbound/${params.id}/fast-pick`, {
            method: 'PUT',
            body: JSON.stringify({
                locationCode: params.locationCode
            }),
        })
    }

    async invalid(id: string) {
        return await iceFetch(`/api/wms/outbound/${id}/invalid`, {
            method: 'PUT',
        })
    }

    async createPickList(params: {
        outboundOrderIds: Array<string>,
        pickListNumber: string,
    }) {
        return await iceFetch('/api/wms/outbound/pick-list', {
            method: 'POST',
            body: JSON.stringify(params)
        })
    }

    async outofstock(id: string) {
        return await iceFetch(`/api/wms/outbound/${id}/outofstock`, {
            method: 'PUT',
        })
    }

    async pick(params: {
        id: string,
        locationCode: string,
        sku: string,
        quantity: number
    }) {
        return await iceFetch(`/api/wms/outbound/${params.id}/pick`, {
            method: 'PUT',
            body: JSON.stringify(params)
        })
    }

    
    async getListWithDetailsForPickId(pickListId: string) {
        return await iceFetch<Array<OutboundOrderEntity>>(`/api/wms/outbound/with-details-for-pick-id/${pickListId}`, {
            method: 'GET',
        })
    }
}

export default new ApiEx();