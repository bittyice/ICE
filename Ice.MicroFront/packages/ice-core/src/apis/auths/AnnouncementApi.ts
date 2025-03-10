import Api from '../Api';
import { iceFetch } from 'ice-common';

type Announcement = {
    title: string,
    content: string,
    expiration: string,
}

class ApiEx {
    async getAnnouncement() {
        return await iceFetch<Announcement>('/api/auth/system/announcement');
    }

    async setAnnouncement(params: Announcement) {
        return await iceFetch('/api/auth/system/set-announcement', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }
}

export default new ApiEx();