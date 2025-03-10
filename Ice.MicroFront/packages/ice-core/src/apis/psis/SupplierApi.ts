import Api from '../Api';
import { SupplierEntity } from '../Types';

class ApiEx extends Api<SupplierEntity> {
    url = '/api/psi/supplier';
}

export default new ApiEx();