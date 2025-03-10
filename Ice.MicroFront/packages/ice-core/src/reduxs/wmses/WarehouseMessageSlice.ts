import api from '../../apis/wmses/WarehouseMessageApi';
import { iceCreateSlick } from 'ice-common';
import iceCreateSliceExpend from '../IceCreateSliceExpend';

export const slice = iceCreateSlick('warehouseMessage', api);
export const actions = slice.actions;
export const reducer = slice.reducer;
