import api from '../../apis/psis/ContractApi';
import { iceCreateSlick } from 'ice-common';

export const slice = iceCreateSlick('contract', api);
export const actions = slice.actions;
export const reducer = slice.reducer;