import { iceFetch } from 'ice-common';
import Api from '../Api';
import { AddressBookEntity } from '../Types';

class ApiEx extends Api<AddressBookEntity> {
    url = '/api/base/address-book';

    getAll = async() => {
        return await iceFetch<Array<AddressBookEntity>>('/api/base/address-book/all', {
            method: 'GET'
        });
    }
}

export default new ApiEx();