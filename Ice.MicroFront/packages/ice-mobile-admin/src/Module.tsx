import React from 'react';
import { BaseModule, ModuleFactory } from 'icetf';
import { Module as CoreModule, enums, svgs } from 'ice-core';
import { MenuProvider } from 'ice-mobile-layout';
import Icon from '@ant-design/icons';
import { token } from 'ice-common';

import {
    AppOutline,
    UserOutline,
    AppstoreOutline,
} from 'antd-mobile-icons';

import Mine from './pages/Mine';
import WxAuth from './pages/WxAuth';

class Module extends BaseModule {
    initialize() {
        MenuProvider.registerMenuGroup({
            backstage: 'admin',
            icon: <Icon component={svgs.Admin} />,
            homePath: '/mine',
            allow: () => token.userInfo.role == enums.IceRoleTypes.Admin,
            text: '管理端',
            showMenuTabs: false
        });

        MenuProvider.registerMenu({
            name: 'mine',
            text: '我的',
            icon: <UserOutline />,
            component: Mine
        }, 'admin');

        MenuProvider.registerMenu({
            name: 'wxbind',
            text: '微信绑定',
            icon: null,
            component: WxAuth
        }, 'admin');
    }
}

const module = new Module();
export default module;

ModuleFactory.register(module, [CoreModule]);
