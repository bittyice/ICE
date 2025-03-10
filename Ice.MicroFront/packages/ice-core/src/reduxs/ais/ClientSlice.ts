import api from '../../apis/ais/ClientApi';
import { iceCreateSlick } from 'ice-common';

export const slice = iceCreateSlick('client', api);
export const actions = slice.actions;
export const reducer = slice.reducer;