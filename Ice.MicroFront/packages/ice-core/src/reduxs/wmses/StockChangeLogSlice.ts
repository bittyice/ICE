import api from '../../apis/wmses/StockChangeLogApi';
import { iceCreateSlick } from 'ice-common';
import iceCreateSliceExpend from '../IceCreateSliceExpend';

export const slice = iceCreateSlick('stockChangeLog', api);
export const actions = slice.actions;
export const reducer = slice.reducer;
