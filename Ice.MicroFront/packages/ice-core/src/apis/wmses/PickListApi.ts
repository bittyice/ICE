import { iceFetch } from 'ice-common';
import Api from '../Api';
import { PickListEntity } from '../Types';
import WmsBaseApi from './WmsBaseApi';

class ApiEx extends WmsBaseApi<PickListEntity> {
    url = '/api/wms/outbound/pick-list';

    async invalidPickList(id: string) {
        return await iceFetch(`/api/wms/outbound/invalid-pick-list/${id}`, {
            method: "PUT"
        });
    }

    async outofstockOfPickList(id: string) {
        return await iceFetch(`/api/wms/outbound/outofstock-of-pick-list/${id}`, {
            method: "PUT"
        });
    }

    async pickingDone(id: string) {
        return await iceFetch(`/api/wms/outbound/picking-done/${id}`, {
            method: 'PUT',
        })
    }
    
    async batchPick(params: {
        items: Array<{
            outboundOrderId: string,
            locationCode: string,
            sku: string,
            quantity: number
        }>
    }) {
        return await iceFetch(`/api/wms/outbound/batch-pick`, {
            method: 'PUT',
            body: JSON.stringify(params)
        })
    }
}

export default new ApiEx();