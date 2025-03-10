import Api from '../Api';
import { CompanyEntity, TenantEntity } from '../Types';
import { iceFetch } from 'ice-common';

class TenantApi {
    url = '/api/auth/tenant';

    async getCurrent() {
        return iceFetch<TenantEntity>('/api/auth/tenant').then(item => {
            item.amount = item.amount / 100;
            return item;
        });
    }

    async ResetGuestKey() {
        return iceFetch<TenantEntity>('/api/auth/tenant/reset-guest-key', {
            method: 'POST',
        });
    }

    async getCompany() {
        return iceFetch<CompanyEntity>('/api/auth/tenant/company');
    }

    async SetCompany(company: CompanyEntity) { 
        return iceFetch<CompanyEntity>('/api/auth/tenant/set-company', {
            method: 'POST',
            body: JSON.stringify(company)
        });
    }
}

export default new TenantApi();