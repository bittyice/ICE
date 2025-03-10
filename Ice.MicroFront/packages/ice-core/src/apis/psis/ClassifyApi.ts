import Api from '../Api';
import { ClassifyEntity } from '../Types';

class ApiEx extends Api<ClassifyEntity> {
    url = '/api/base/classify';
}

export default new ApiEx();