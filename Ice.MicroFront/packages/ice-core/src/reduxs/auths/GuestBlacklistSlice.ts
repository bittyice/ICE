import api from '../../apis/auths/GuestBlacklistApi';
import { iceCreateSlick } from 'ice-common';
import iceCreateSliceExpend from '../IceCreateSliceExpend';

export const slice = iceCreateSlick('guestBlacklist', api);
export const actions = slice.actions;
export const reducer = slice.reducer;