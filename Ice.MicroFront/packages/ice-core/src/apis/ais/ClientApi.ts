import Api from '../Api';
import { ClientEntity } from '../Types';

class ApiEx extends Api<ClientEntity> {
    url = '/api/ai/client';
}

export default new ApiEx();