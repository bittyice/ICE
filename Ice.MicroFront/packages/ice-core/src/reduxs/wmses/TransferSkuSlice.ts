import api from '../../apis/wmses/TransferSkuApi';
import { iceCreateSlick } from 'ice-common';
import iceCreateSliceExpend from '../IceCreateSliceExpend';

export const slice = iceCreateSlick('transferSku', api);
export const actions = slice.actions;
export const reducer = slice.reducer;
