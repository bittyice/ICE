import api from '../../apis/wmses/InboundOrderApi';
import { iceCreateSlick } from 'ice-common';
import iceCreateSliceExpend from '../IceCreateSliceExpend';

export const slice = iceCreateSlick('inboundOrder', api);
export const actions = slice.actions;
export const reducer = slice.reducer;
