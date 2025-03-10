import Api, { FilterValueType } from '../Api';
import { AmountAdjustEntity } from '../Types';

class AmountAdjustApi extends Api<AmountAdjustEntity> {
    url = '/api/auth/amount-adjust';

    async get(id: string): Promise<AmountAdjustEntity> {
        return await super.get(id).then(entity => {
            entity.oldAmount = entity.oldAmount! / 100;
            entity.adjustFee = entity.adjustFee! / 100;
            return entity;
        });
    }

    async create(model: AmountAdjustEntity): Promise<AmountAdjustEntity> {
        return await super.create({
            ...model,
            oldAmount: model.oldAmount! * 100,
            adjustFee: model.adjustFee! * 100
        });
    }

    async update(model: AmountAdjustEntity): Promise<AmountAdjustEntity> {
        return await super.update({
            ...model,
            oldAmount: model.oldAmount! * 100,
            adjustFee: model.adjustFee! * 100
        });
    }

    async getList(
        page: number, 
        pageSize: number, 
        filters?: { [k in (keyof AmountAdjustEntity)]: FilterValueType },
        sortField?: keyof AmountAdjustEntity, 
        sortDirection?: 'ascend' | 'descend' | undefined): Promise<{ total: number; datas: AmountAdjustEntity[]; }> 
    {
        return await super.getList(page, pageSize, filters, sortField, sortDirection).then(res => {
            res.datas.forEach(entity => {
                entity.oldAmount = entity.oldAmount! / 100;
                entity.adjustFee = entity.adjustFee! / 100;
            });
            return res;
        })
    }
}

export default new AmountAdjustApi();