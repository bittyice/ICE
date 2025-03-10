import api from '../../apis/wmses/PickListApi';
import { iceCreateSlick } from 'ice-common';
import iceCreateSliceExpend from '../IceCreateSliceExpend';

export const slice = iceCreateSlick('pickList', api);
export const actions = slice.actions;
export const reducer = slice.reducer;
