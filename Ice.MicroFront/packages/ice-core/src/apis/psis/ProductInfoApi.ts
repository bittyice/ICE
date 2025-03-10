import Api, { FilterValueType } from '../Api';
import { ProductInfoEntity } from '../Types';
import { iceFetch } from 'ice-common';

class ApiEx extends Api<ProductInfoEntity> {
    url = '/api/base/product-info';

    async getForNames(params: {
        names: Array<string>
    }) {
        return await iceFetch<Array<ProductInfoEntity>>('/api/base/product-info/for-names', {
            method: 'GET',
            urlParams: params
        });
    }

    async getForSkus(params: {
        skus: Array<string>
    }) {
        return await iceFetch<Array<ProductInfoEntity>>('/api/base/product-info/for-skus', {
            method: 'GET',
            urlParams: params
        });
    }

    async getAll() {
        return await iceFetch<Array<ProductInfoEntity>>('/api/base/product-info/all', {
            method: 'GET',
        });
    }

    async getWithDetailsForSku(sku: string) {
        return await iceFetch<ProductInfoEntity>('/api/base/product-info/with-details-for-sku', {
            method: 'GET',
            urlParams: {
                sku: sku
            }
        });
    }
}

export default new ApiEx();