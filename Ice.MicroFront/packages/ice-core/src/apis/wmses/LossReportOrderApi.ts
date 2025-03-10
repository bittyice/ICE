import Api from '../Api';
import { LossReportOrderEntity } from '../Types';
import WmsBaseApi from './WmsBaseApi';

class ApiEx extends WmsBaseApi<LossReportOrderEntity> {
    url = '/api/wms/loss-report-order';
}

export default new ApiEx();