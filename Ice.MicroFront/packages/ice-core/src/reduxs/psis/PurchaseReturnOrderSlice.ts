import api from '../../apis/psis/PurchaseReturnOrderApi';
import { iceCreateSlick } from 'ice-common';

export const slice = iceCreateSlick('purchaseReturnOrder', api);
export const actions = slice.actions;
export const reducer = slice.reducer;