import api from '../../apis/psis/QuoteApi';
import { iceCreateSlick } from 'ice-common';

export const slice = iceCreateSlick('quote', api);
export const actions = slice.actions;
export const reducer = slice.reducer;