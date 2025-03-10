import Api, { FilterValueType } from '../Api';
import { QuoteEntity } from '../Types';
import { iceFetch } from 'ice-common';

class ApiEx extends Api<QuoteEntity> {
    url = '/api/psi/quote';

    async getSupplierQuote(params: {
        supplierId: string,
        skus: Array<string>
    }) {
        return await iceFetch<Array<QuoteEntity>>('/api/psi/quote/supplier-quote', {
            method: 'GET',
            urlParams: params
        });
    }
}

export default new ApiEx();