import Api from '../Api';
import { QuestionnaireEntity } from '../Types';

class ApiEx extends Api<QuestionnaireEntity> {
    url = '/api/ai/questionnaire';
}

export default new ApiEx();