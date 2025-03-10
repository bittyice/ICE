import api from '../../apis/wmses/OutboundOrderApi';
import { iceCreateSlick } from 'ice-common';
import iceCreateSliceExpend from '../IceCreateSliceExpend';

export const slice = iceCreateSlick('outboundOrder', api);
export const actions = slice.actions;
export const reducer = slice.reducer;
