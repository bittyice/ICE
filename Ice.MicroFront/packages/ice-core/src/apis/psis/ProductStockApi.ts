import Api from '../Api';
import { ProductStockEntity } from '../Types';
import { iceFetch } from 'ice-common';

class ApiEx {
    url = '/api/psi/product-stock';

    async getListForSkus(params: {
        skus: Array<string>
    }) {
        return await iceFetch<Array<ProductStockEntity>>('/api/psi/product-stock/for-skus', {
            method: 'GET',
            urlParams: params
        });
    }

    async SetStocks(params: {
        items: Array<{ sku: string, stock: number }>
    }) {
        return await iceFetch('/api/psi/product-stock/set-stocks', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    async AddStocks(params: {
        items: Array<{ sku: string, stock: number }>
    }) {
        return await iceFetch('/api/psi/product-stock/add-stocks', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }
}

export default new ApiEx();