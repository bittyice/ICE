import { iceFetch } from 'ice-common';
import Api from '../Api';
import { LocationDetailEntity } from '../Types';
import WmsBaseApi from './WmsBaseApi';

class ApiEx extends WmsBaseApi<LocationDetailEntity> {
    url = '/api/wms/location-detail';

    async getLocationDetailForSku(params: {
        locationCode: string,
        sku: string,
        warehouseId: string,
    }) {
        return await iceFetch<LocationDetailEntity>('/api/wms/location-detail/location-detail-for-sku', {
            method: 'GET',
            urlParams: params
        })
    }
}

export default new ApiEx();