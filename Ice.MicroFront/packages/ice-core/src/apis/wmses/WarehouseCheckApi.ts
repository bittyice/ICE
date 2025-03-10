import { iceFetch } from 'ice-common';
import Api from '../Api';
import { WarehouseCheckEntity } from '../Types';
import WmsBaseApi from './WmsBaseApi';

class ApiEx extends WmsBaseApi<WarehouseCheckEntity> {
    url = '/api/wms/warehouse-check';

    async check(params: {
        warehouseId: string,
        sku: string,
        quantity: number,
        locationCode: string,
        shelfLise?: string,
        inboundBatch?: string,
        warehouseCheckId?: string,
    }) {
        return await iceFetch('/api/wms/warehouse-check/check', {
            method: 'PUT',
            body: JSON.stringify(params)
        })
    }

    async invalid(id: string) {
        return await iceFetch(`/api/wms/warehouse-check/${id}/invalid`, {
            method: 'PUT',
        })
    }

    async start(id: string) {
        return await iceFetch(`/api/wms/warehouse-check/${id}/start`, {
            method: 'PUT',
        })
    }

    async finish(id: string) {
        return await iceFetch(`/api/wms/warehouse-check/${id}/finish`, {
            method: 'PUT',
        })
    }
}

export default new ApiEx();