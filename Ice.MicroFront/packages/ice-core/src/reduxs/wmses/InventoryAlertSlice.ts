import api from '../../apis/wmses/InventoryAlertApi';
import { iceCreateSlick } from 'ice-common';
import iceCreateSliceExpend from '../IceCreateSliceExpend';

export const slice = iceCreateSlick('inventoryAlert', api);
export const actions = slice.actions;
export const reducer = slice.reducer;
