import React from 'react';
import { BaseModule, ModuleFactory, PageProvider } from 'icetf';
import { Module as CoreModule, configuration, enums, svgs } from 'ice-core';
import { MenuProvider } from 'ice-mobile-layout';
import Icon from '@ant-design/icons';
import { token } from 'ice-common';

import {
    AppOutline,
    UserOutline,
    AppstoreOutline,
} from 'antd-mobile-icons';

import QAOnline from './pages/QAOnline';
import QAOfGuest from './pages/QAOfGuest';

class Module extends BaseModule {
    initialize() {
        MenuProvider.registerMenuGroup({
            backstage: 'ai',
            icon: <Icon component={svgs.QA} />,
            homePath: '/qa',
            allow: () => token.userInfo.role == enums.IceRoleTypes.Admin && token.userInfo.scope?.some(e => e == enums.IceResourceScopes.AIScope) == true,
            text: 'AI客服',
            showMenuTabs: false
        });

        MenuProvider.registerMenu({
            name: 'qa',
            text: '在线问答',
            icon: <UserOutline />,
            component: QAOnline
        }, 'ai');

        PageProvider.register({
            name: 'QAOfGuest',
            url: `${configuration.mobileRouterPre}/qa-of-guest`,
            element: <QAOfGuest />
        });
    }
}

const module = new Module();
export default module;

ModuleFactory.register(module, [CoreModule]);
