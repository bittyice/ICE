import api from '../../apis/wmses/LossReportOrderApi';
import { iceCreateSlick } from 'ice-common';
import iceCreateSliceExpend from '../IceCreateSliceExpend';

export const slice = iceCreateSlick('lossReportOrder', api);
export const actions = slice.actions;
export const reducer = slice.reducer;
