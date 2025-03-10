import { iceFetch } from 'ice-common';
import Api from '../Api';
import { LocationEntity } from '../Types';
import WmsBaseApi from './WmsBaseApi';

class ApiEx extends WmsBaseApi<LocationEntity> {
    url = '/api/wms/location';

    async import(params: {
        areaId: string,
        importLocations: Array<{
            code: string,
            volume?: number
        }>
    }) {
        return await iceFetch(`/api/wms/location/import`, {
            method: 'POST',
            body: JSON.stringify(params)
        })
    }

    async setOften(params: {
        id: string,
        often: boolean
    }) {
        return await iceFetch(`/api/wms/location/${params.id}/set-often`, {
            method: 'PUT',
            body: JSON.stringify({
                often: params.often
            })
        });
    }

    async freeze(params: {
        warehouseId: string,
        locationCode: string,
        sku: string
    }) {
        return await iceFetch('/api/wms/location/freeze', {
            method: 'PUT',
            body: JSON.stringify(params)
        })
    }

    async unfreeze(params: {
        warehouseId: string,
        locationCode: string,
        sku: string
    }) {
        return await iceFetch('/api/wms/location/unfreeze', {
            method: 'PUT',
            body: JSON.stringify(params)
        })
    }

    async freezeForInboundBatch(params: {
        warehouseId: string,
        inboundBatch: string,
    }) {
        return await iceFetch('/api/wms/location/freeze-for-inbound-batch', {
            method: 'PUT',
            body: JSON.stringify(params)
        })
    }

    async unfreezeForInboundBatch(params: {
        warehouseId: string,
        inboundBatch: string,
    }) {
        return await iceFetch('/api/wms/location/unfreeze-for-inbound-batch', {
            method: 'PUT',
            body: JSON.stringify(params)
        })
    }

    async unboxing(params: {
        warehouseId: string,
        unboxLocationCode: string,
        unboxSku: string,
        unboxQuantity: number,
        onshlefLocationCode: string,
        onshlefItems: Array<{sku: string, quantity: number}>
    }) {
        return await iceFetch('/api/wms/location/unboxing', {
            method: 'POST',
            body: JSON.stringify(params)
        })
    }
}

export default new ApiEx();