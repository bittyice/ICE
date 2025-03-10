import { iceFetch } from 'ice-common';
import Api from '../Api';
import { GuestBlacklistEntity } from '../Types';

class ApiEx extends Api<GuestBlacklistEntity> {
    url = '/api/auth/guest-blacklist';
}

export default new ApiEx();