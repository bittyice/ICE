import Api, { FilterValueType } from '../Api';
import { Entity } from '../Types';

type WmsEntity = {
    warehouseId?: string;
} & Entity;


var store: any;
export const setStore = (s: any) => {
    store = s;
}

abstract class WmsBaseApi<T extends WmsEntity> extends Api<T> {
    async create(model: T): Promise<T> {
        let newModel = { ...model };
        if (!newModel.warehouseId) {
            newModel.warehouseId = store.getState().global.warehouseId;
        }
        return await super.create(newModel);
    }

    async update(model: T): Promise<T> {
        return await super.update(model);
    }

    async getList(
        page: number,
        pageSize: number,
        filters?: { [k in (keyof T)]: FilterValueType },
        sortField?: keyof T,
        sortDirection?: "ascend" | "descend"): Promise<{ total: number, datas: Array<T> }> {
        return await super.getList(
            page,
            pageSize,
            {
                ...filters,
                warehouseId: store.getState().global.warehouseId
            } as any,
            sortField,
            sortDirection)
    }
}

export default WmsBaseApi;