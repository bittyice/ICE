import { iceFetch } from 'ice-common';
import Api from '../Api';
import { TransferSkuEntity } from '../Types';
import WmsBaseApi from './WmsBaseApi';

class ApiEx extends WmsBaseApi<TransferSkuEntity> {
    url = '/api/wms/transfer/transfer-skus';

    async offShelf(params: {
        warehouseId: string,
        sku: string,
        quantity: number,
        locationCode: string,
    }) {
        return await iceFetch(`/api/wms/transfer/off-shelf`, {
            method: 'PUT',
            body: JSON.stringify(params)
        })
    }

    async onShelf(params: {
        transferSkuId: string,
        quantity: number,
        locationCode: string,
        enforce: boolean,
        warehouseId: string,
    }) {
        return await iceFetch(`/api/wms/transfer/on-shelf`, {
            method: 'PUT',
            body: JSON.stringify(params)
        })
    }

    async findTransferSkus(params: {
        warehouseId: string,
        sku: string,
    }) {
        return await iceFetch<Array<TransferSkuEntity>>(`/api/wms/transfer/find-transfer-skus`, {
            method: 'GET',
            urlParams: params
        })
    }
}

export default new ApiEx();