import { BaseModule, ModuleFactory } from 'icetf';
import { Module as CoreModule } from 'ice-core';
import { Module as LayoutModule } from 'ice-mobile-layout';
import { Module as PSIModule } from 'ice-mobile-psi';
import { Module as AIModule } from 'ice-mobile-ai';
import { Module as AdminModule } from 'ice-mobile-admin';
import { Storage, token } from 'ice-common';

class Module extends BaseModule {
    preInitialize() {
        // 初始化 Storage
        Storage.setItem = (key, value) => {
            localStorage.setItem(key, value);
            return Promise.resolve();
        }
        Storage.getItem = (key) => {
            return Promise.resolve(localStorage.getItem(key));
        }
        Storage.removeItem = (key) => {
            localStorage.removeItem(key);
            return Promise.resolve();
        }

        // 初始化token
        return token.init();
    }

    initialize() {
    }
}

const module = new Module();
export default module;

ModuleFactory.register(module, [
    CoreModule,
    LayoutModule,
    AdminModule,
    PSIModule,
    AIModule
]);