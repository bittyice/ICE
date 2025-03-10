import Api from '../Api';
import { AllowOpenServiceType, OpenServiceEntity } from '../Types';
import { iceFetch } from 'ice-common';

class OpenServiceApi {
    url = '/api/auth/tenant';

    async GetSystemOpenServices() {
        return iceFetch<Array<AllowOpenServiceType>>('/api/auth/open-service/system-open-services').then(arr => {
            arr.forEach(item => {
                item.fee = item.fee / 100;
            });
            return arr;
        });
    }

    async GetOpenServices() {
        return iceFetch<Array<OpenServiceEntity>>('/api/auth/open-service/open-services');
    }

    async ExtendOpenServiceDueDate(params: {
        key: string
    }) {
        return iceFetch<void>('/api/auth/open-service/extend-open-service-due-date', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }
}

export default new OpenServiceApi();