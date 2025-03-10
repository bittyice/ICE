import { QAType, QaAdditionalMetadata } from '../Types';
import { iceFetch } from 'ice-common';

class QaApi {
    async getList(params: {
        offsetId: string | null,
        question?: string,
        limit: number
    }) {
        return await iceFetch<{
            items: Array<QAType>,
            nextPageOffsetId: string
        }>('/api/ai/qa/qa-list', {
            urlParams: params
        }).then(res => {
            res.items.forEach(data => {
                if (data.additionalMetadata) {
                    try {
                        data.additionalMetadataObj = JSON.parse(data.additionalMetadata);
                    } catch { }
                }
            })
            return res;
        });
    }

    async delete(id: string) {
        await iceFetch('/api/ai/qa/delete', {
            method: 'Delete',
            urlParams: {
                id: id
            }
        });
    }

    async deleteAll() {
        await iceFetch('/api/ai/qa/delete-all', {
            method: 'Delete'
        });
    }

    async add(params: {
        question: string,
        answer: string,
        href?: string
    }) {
        await iceFetch('/api/ai/qa/add', {
            method: 'POST',
            body: JSON.stringify({
                question: params.question,
                answer: params.answer,
                additionalMetadata: JSON.stringify({
                    href: params.href
                } as QaAdditionalMetadata)
            })
        });
    }

    async update(params: {
        id: string,
        question: string,
        answer: string,
        href?: string
    }) {
        await iceFetch(`/api/ai/qa/update?id=${params.id}`, {
            method: 'POST',
            body: JSON.stringify({
                question: params.question,
                answer: params.answer,
                additionalMetadata: JSON.stringify({
                    href: params.href
                } as QaAdditionalMetadata)
            })
        });
    }

    async qa(params: {
        question: string,
    }) {
        return await iceFetch<QAType>('/api/ai/qa/qa', {
            method: 'POST',
            body: JSON.stringify(params)
        }).then(data => {
            if (data.additionalMetadata) {
                try {
                    data.additionalMetadataObj = JSON.parse(data.additionalMetadata);
                } catch { }
            }
            return data;
        });
    }
}

export default new QaApi();