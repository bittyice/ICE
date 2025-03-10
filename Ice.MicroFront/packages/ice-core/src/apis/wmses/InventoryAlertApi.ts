import Api from '../Api';
import { InventoryAlertEntity } from '../Types';
import WmsBaseApi from './WmsBaseApi';

class ApiEx extends WmsBaseApi<InventoryAlertEntity> {
    url = '/api/wms/inventory-alert';
}

export default new ApiEx();