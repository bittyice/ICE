import api from '../../apis/psis/ClassifyApi';
import { iceCreateSlick } from 'ice-common';
import iceCreateSliceExpend from '../IceCreateSliceExpend';
import consts from '../../consts/consts';

export const slice = iceCreateSliceExpend('classify', api, () => api.getList(1, consts.PageSizeLength).then(res => res.datas));
export const actions = slice.actions;
export const reducer = slice.reducer;
