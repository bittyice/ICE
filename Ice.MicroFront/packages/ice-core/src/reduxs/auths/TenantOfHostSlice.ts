import api from '../../apis/auths/TenantOfHostApi';
import { iceCreateSlick } from 'ice-common';

export const slice = iceCreateSlick('tenantOfHost', api);
export const actions = slice.actions;
export const reducer = slice.reducer;