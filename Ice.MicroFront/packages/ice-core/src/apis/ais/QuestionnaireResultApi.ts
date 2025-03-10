import { iceFetch } from 'ice-common';
import Api from '../Api';
import { QuestionnaireResultEntity } from '../Types';

class ApiEx extends Api<QuestionnaireResultEntity> {
    url = '/api/ai/questionnaire-result';

    async setTagName(params: {
        id: string,
        tagName?: string
    }) {
        await iceFetch(`/api/ai/questionnaire-result/${params.id}/set-tag-name`, {
            method: 'POST',
            body: JSON.stringify({
                tagName: params.tagName
            })
        });
    }
}

export default new ApiEx();