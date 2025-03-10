import Api from '../Api';
import { StockChangeLogEntity } from '../Types';
import WmsBaseApi from './WmsBaseApi';

class ApiEx extends WmsBaseApi<StockChangeLogEntity> {
    url = '/api/wms/stock-change-log';
}

export default new ApiEx();