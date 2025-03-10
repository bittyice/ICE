import api from '../../apis/wmses/WarehouseCheckApi';
import { iceCreateSlick } from 'ice-common';
import iceCreateSliceExpend from '../IceCreateSliceExpend';

export const slice = iceCreateSlick('warehouseCheck', api);
export const actions = slice.actions;
export const reducer = slice.reducer;
