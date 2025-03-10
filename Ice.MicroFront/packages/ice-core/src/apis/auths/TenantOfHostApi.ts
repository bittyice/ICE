import Api, { FilterValueType } from '../Api';
import { TenantEntity } from '../Types';
import { iceFetch } from 'ice-common';

class TenantOfHostApi extends Api<TenantEntity> {
    url = '/api/auth/tenant-of-host';

    async get(id: string): Promise<TenantEntity> {
        return await super.get(id).then(entity => {
            entity.amount = entity.amount! / 100;
            return entity;
        });
    }

    async create(model: TenantEntity): Promise<TenantEntity> {
        return await super.create({
            ...model,
            amount: model.amount! * 100,
        });
    }

    async update(model: TenantEntity): Promise<TenantEntity> {
        return await super.update({
            ...model,
            amount: model.amount! * 100,
        });
    }

    async getList(
        page: number, 
        pageSize: number, 
        filters?: { [k in (keyof TenantEntity)]: FilterValueType },
        sortField?: keyof TenantEntity, 
        sortDirection?: 'ascend' | 'descend' | undefined): Promise<{ total: number; datas: TenantEntity[]; }> 
    {
        return await super.getList(page, pageSize, filters, sortField, sortDirection).then(res => {
            res.datas.forEach(entity => {
                entity.amount = entity.amount! / 100;
            });
            return res;
        })
    }

    async adjustAmount(params: {
        amount: number,
        remark?: string,
        tenantId: string,
    }) {
        await iceFetch('/api/auth/tenant-of-host/adjust-amount', {
            method: 'POST',
            body: JSON.stringify({
                ...params,
                amount: params.amount * 100,
            })
        })
    }

    async setSaler(params: {
        id: string,
        saler: string
    }) {
        await iceFetch(`/api/auth/tenant-of-host/${params.id}/set-saler`, {
            method: 'POST',
            body: JSON.stringify({
                saler: params.saler
            })
        })
    }

    async extendOpenServiceDueDate(params: {
        id: string,
        name: string,
        daynum: number
    }) {
        await iceFetch(`/api/auth/tenant-of-host/${params.id}/extend-open-service-due-date`, {
            method: 'POST',
            body: JSON.stringify({
                name: params.name,
                daynum: params.daynum
            })
        })
    }
}

export default new TenantOfHostApi();