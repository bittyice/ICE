import api from '../../apis/psis/SaleReturnOrderApi';
import { iceCreateSlick } from 'ice-common';

export const slice = iceCreateSlick('saleReturnOrder', api);
export const actions = slice.actions;
export const reducer = slice.reducer;