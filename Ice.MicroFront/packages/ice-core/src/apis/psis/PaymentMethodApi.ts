import Api from '../Api';
import { PaymentMethodEntity } from '../Types';

class ApiEx extends Api<PaymentMethodEntity> {
    url = '/api/psi/payment-method';
}

export default new ApiEx();