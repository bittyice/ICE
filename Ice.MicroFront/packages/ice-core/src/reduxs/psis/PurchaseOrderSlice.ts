import api from '../../apis/psis/PurchaseOrderApi';
import { iceCreateSlick } from 'ice-common';

export const slice = iceCreateSlick('purchaseOrder', api);
export const actions = slice.actions;
export const reducer = slice.reducer;