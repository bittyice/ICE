import api from '../../apis/psis/ProductInfoApi';
import { iceCreateSlick } from 'ice-common';
import iceCreateSliceExpend from '../IceCreateSliceExpend';

export const slice = iceCreateSliceExpend('productInfo', api, () => api.getAll());
export const actions = slice.actions;
export const reducer = slice.reducer;