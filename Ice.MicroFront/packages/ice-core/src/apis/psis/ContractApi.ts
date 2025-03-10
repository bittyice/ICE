import Api from '../Api';
import { ContractEntity } from '../Types';

class ApiEx extends Api<ContractEntity> {
    url = '/api/psi/contract';
}

export default new ApiEx();