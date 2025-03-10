import { iceFetch } from 'ice-common';
import Api from '../Api';
import { InboundOrderEntity } from '../Types';
import WmsBaseApi from './WmsBaseApi';

class ApiEx extends WmsBaseApi<InboundOrderEntity> {
    url = '/api/wms/inbound';

    async check(params: {
        id: string,
        sku: string,
        forecastQuantity: number,
        actualQuantity: number,
        shelfLise?: string,
        remark?: string | null
    }) {
        return await iceFetch(`/api/wms/inbound/${params.id}/check`, {
            method: 'PUT',
            body: JSON.stringify(params)
        });
    }

    async toOnShelf(id: string) {
        return await iceFetch(`/api/wms/inbound/${id}/to-on-shelf`, {
            method: 'PUT',
        })
    }

    async onShelf(params: {
        id: string,
        sku: string,
        quantity: number,
        locationCode: string,
        enforce: boolean
    }) {
        return await iceFetch(`/api/wms/inbound/${params.id}/on-shelf`, {
            method: 'PUT',
            body: JSON.stringify(params)
        })
    }

    async finishOnShelf(id: string) {
        return await iceFetch(`/api/wms/inbound/${id}/finish-on-shelf`, {
            method: 'PUT',
        });
    }

    async getRecommendOnShelfLocation(params: {
        warehouseId: string,
        sku: string,
        shelfLise?: string
    }) {
        return await iceFetch(`/api/wms/location-detail/recommend-on-shelf-location`, {
            method: 'GET',
            urlParams: params
        });
    }

    async getListWithDetail(params: {
        ids: Array<string>
    }) {
        return await iceFetch<Array<InboundOrderEntity>>('/api/wms/inbound/with-detail', {
            method: 'GET',
            urlParams: params
        })
    }

    async fastOnshlef(params: {
        id: string,
        locationCode: string,
    }) {
        return await iceFetch(`/api/wms/inbound/${params.id}/fast-onshlef`, {
            method: 'PUT',
            body: JSON.stringify({
                locationCode: params.locationCode
            })
        })
    }

    async receipt(id: string) {
        return await iceFetch(`/api/wms/inbound/${id}/receipt`, {
            method: 'PUT'
        })
    }

    async invalid(id: string) {
        return await iceFetch(`/api/wms/inbound/${id}/invalid`, {
            method: 'PUT'
        })
    }
}

export default new ApiEx();