import Api from '../Api';
import { CsTextEntity } from '../Types';

class ApiEx extends Api<CsTextEntity> {
    url = '/api/ai/cs-text';
}

export default new ApiEx();