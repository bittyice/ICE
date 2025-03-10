import React from 'react'
import { BaseModule, ModuleFactory } from 'icetf';
import { Module as CoreModule, enums } from 'ice-core';
import { Module as LayoutModule, MenuProvider } from 'ice-layout';
import { HomeOutlined, CarryOutOutlined } from '@ant-design/icons';
import { token } from 'ice-common';

// 页面
import Tenant from './pages/Tenant';
import Announcement from './pages/Announcement';

class Module extends BaseModule {
    initialize() {
        MenuProvider.registerMenuGroup({
            backstage: 'saas',
            icon: <HomeOutlined />,
            text: '宿主端',
            homePath: '/home',
            allow: () => token.userInfo.role == enums.IceRoleTypes.Host
        });
        MenuProvider.registerMenu({
            name: 'home',
            icon: <HomeOutlined />,
            text: '首页',
            component: Tenant,
            menuItems: null
        }, 'saas', 0);
        MenuProvider.registerMenu({
            name: 'announcement',
            icon: <CarryOutOutlined />,
            text: '公告',
            component: Announcement,
            menuItems: null
        }, 'saas', 2);
    }
}

const module = new Module();
export default module;

ModuleFactory.register(module, [CoreModule, LayoutModule]);
