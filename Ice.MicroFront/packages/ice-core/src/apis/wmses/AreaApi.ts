import Api from '../Api';
import { AreaEntity } from '../Types';
import WmsBaseApi from './WmsBaseApi';

class ApiEx extends WmsBaseApi<AreaEntity> {
    url = '/api/wms/area';
}

export default new ApiEx();