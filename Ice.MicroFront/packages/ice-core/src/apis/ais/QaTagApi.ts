import Api from '../Api';
import { QaTagEntity } from '../Types';

class ApiEx extends Api<QaTagEntity> {
    url = '/api/ai/qa-tag';
}

export default new ApiEx();