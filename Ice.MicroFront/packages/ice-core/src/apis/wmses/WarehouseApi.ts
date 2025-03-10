import Api from '../Api';
import { WarehouseEntity } from '../Types';

class ApiEx extends Api<WarehouseEntity> {
    url = '/api/wms/warehouse';
}

export default new ApiEx();