import { GptEntity } from '../Types';
import { iceFetch } from 'ice-common';

class GptApi {
    async get() {
        return iceFetch<GptEntity>('/api/ai/gpt');
    }

    async post(data: GptEntity) {
        return iceFetch<GptEntity>('/api/ai/gpt', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

export default new GptApi();