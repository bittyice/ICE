import { iceFetch } from 'ice-common';
import Api from '../Api';
import { WarehouseMessageEntity } from '../Types';
import WmsBaseApi from './WmsBaseApi';

class ApiEx extends WmsBaseApi<WarehouseMessageEntity> {
    url = '/api/wms/warehouse-message';

    async read(id: string) {
        return await iceFetch(`/api/wms/warehouse-message/${id}/read`, {
            method: 'PUT'
        }) 
    }
}

export default new ApiEx();