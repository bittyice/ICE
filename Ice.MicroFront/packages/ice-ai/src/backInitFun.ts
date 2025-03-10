import { store, globalSlice } from 'ice-core';

export default () => {
    store.dispatch(globalSlice.asyncActions.fetchGpt({}));
}