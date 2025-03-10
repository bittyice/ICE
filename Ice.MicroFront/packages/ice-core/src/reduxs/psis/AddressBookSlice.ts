import api from '../../apis/psis/AddressBookApi';
import { iceCreateSlick } from 'ice-common';
import iceCreateSliceExpend from '../IceCreateSliceExpend';

export const slice = iceCreateSliceExpend('addressBook', api, () => api.getAll());
export const actions = slice.actions;
export const reducer = slice.reducer;