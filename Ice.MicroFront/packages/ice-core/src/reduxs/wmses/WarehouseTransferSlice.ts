import api from '../../apis/wmses/WarehouseTransferApi';
import { iceCreateSlick } from 'ice-common';
import iceCreateSliceExpend from '../IceCreateSliceExpend';

export const slice = iceCreateSlick('warehouseTransfer', api);
export const actions = slice.actions;
export const reducer = slice.reducer;
