import api from '../../apis/auths/AmountAdjustApi';
import { iceCreateSlick } from 'ice-common';

export const slice = iceCreateSlick('amountAdjust', api);
export const actions = slice.actions;
export const reducer = slice.reducer;