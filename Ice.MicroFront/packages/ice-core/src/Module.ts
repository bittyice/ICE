import { BaseModule, ModuleFactory } from 'icetf';
import { setStore } from './apis/wmses/WmsBaseApi';
import store from './reduxs/store';
import { token } from 'ice-common';

class Module extends BaseModule {
    preInitialize() {
    }

    initialize() {
        setStore(store);
    }

    postInitialize() {
    }
}

const module = new Module();
export default module;

ModuleFactory.register(module, [
]);