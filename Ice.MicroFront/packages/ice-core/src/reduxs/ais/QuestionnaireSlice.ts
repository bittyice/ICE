import api from '../../apis/ais/QuestionnaireApi';
import { iceCreateSlick } from 'ice-common';

export const slice = iceCreateSlick('questionnaire', api);
export const actions = slice.actions;
export const reducer = slice.reducer;