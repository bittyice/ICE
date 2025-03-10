import { iceFetch, BaseApi } from "ice-common";
import { Entity } from "./Types";

export type FilterValueType = undefined | boolean | number | string | Array<number | string | Date>;

export const toUrlParams = (
    page?: number,
    pageSize?: number,
    filters?: any,
    sortField?: any,
    sortDirection?: "ascend" | "descend") => {
    let urlParams = {} as any;

    if (page && pageSize) {
        urlParams.skipCount = (page - 1) * pageSize;
        urlParams.maxResultCount = pageSize;
    }

    if (filters) {
        for (let key of Object.keys(filters)) {
            let value = (filters as any)[key] as FilterValueType;
            if (value === undefined || value === null) {
                continue;
            }

            if (Array.isArray(value) && value.length > 0) {
                // 范围筛选
                if (typeof (value[0]) == 'number' || typeof (value[1]) == 'number') {
                    urlParams[`${key}Min`] = value[0];
                    urlParams[`${key}Max`] = value[1];
                    continue;
                }

                // 日期范围筛选
                if (typeof (value[0]) == 'object' || typeof (value[1]) == 'object') {
                    urlParams[`${key}Min`] = (value[0] as Date)?.toISOString();
                    urlParams[`${key}Max`] = (value[1] as Date)?.toISOString();
                    continue;
                }

                // 多选值筛选
                if (typeof (value[0]) == 'string') {
                    urlParams[`${key}%5B%5D`] = value;
                    continue;
                }
            }

            urlParams[key] = value;
        }
    }

    if (sortField) {
        urlParams['sorting'] = sortField;
    }

    if (sortDirection) {
        urlParams['sortDirection'] = sortDirection;
    }

    return urlParams;
}

export default abstract class Api<T extends Entity> extends BaseApi<T>  {
    abstract url: string;

    async get(id: string): Promise<T> {
        let newUrl = `${this.url}/${id}`;
        return await iceFetch<T>(newUrl);
    }

    async create(model: T): Promise<T> {
        return await iceFetch<T>(this.url, {
            method: 'POST',
            body: JSON.stringify(model),
        });
    }

    async update(model: T): Promise<T> {
        return await iceFetch<T>(`${this.url}/${model.id}`, {
            method: 'PUT',
            body: JSON.stringify(model)
        });
    }

    async delete(id: string): Promise<void> {
        return await iceFetch<void>(`${this.url}/${id}`, {
            method: 'DELETE'
        });
    }

    async getList(
        page: number,
        pageSize: number,
        filters?: { [k in (keyof T)]: FilterValueType },
        sortField?: keyof T,
        sortDirection?: "ascend" | "descend"): Promise<{ total: number, datas: Array<T> }> {

        let urlParams = toUrlParams(page, pageSize, filters, sortField, sortDirection)
        let result = await iceFetch<{
            items: Array<T>,
            totalCount: number
        }>(this.url, {
            urlParams
        });

        return {
            datas: result.items,
            total: result.totalCount
        }
    }
}