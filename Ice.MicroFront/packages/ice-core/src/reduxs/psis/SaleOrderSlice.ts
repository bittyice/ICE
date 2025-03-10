import api from '../../apis/psis/SaleOrderApi';
import { iceCreateSlick } from 'ice-common';

export const slice = iceCreateSlick('saleOrder', api);
export const actions = slice.actions;
export const reducer = slice.reducer;