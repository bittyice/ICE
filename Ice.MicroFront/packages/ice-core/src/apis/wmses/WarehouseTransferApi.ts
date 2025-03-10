import Api from '../Api';
import { WarehouseTransferEntity } from '../Types';

class ApiEx extends Api<WarehouseTransferEntity> {
    url = '/api/wms/warehouse-transfer';
}

export default new ApiEx();