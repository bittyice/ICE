import React from 'react';
import { BaseModule, ModuleFactory, PageProvider } from 'icetf';
import { Module as CoreModule, svgs, enums } from 'ice-core';
import { Module as LayoutModule, MenuProvider } from 'ice-layout';
import Icon, { HomeOutlined, SolutionOutlined, MoneyCollectOutlined, FileSearchOutlined, KeyOutlined, CloudServerOutlined, ShopOutlined} from '@ant-design/icons';
import { token } from 'ice-common';

// 页面
import Home from './pages/Home';
import Recharge from './pages/Recharge';
import AmountAdjust from './pages/AmountAdjust';
import BaseInfo from './pages/BaseInfo';
import OpenService from './pages/OpenService';
import Warehouse from './pages/Warehouse';
import GuestBlacklist from './pages/GuestBlacklist';

class Module extends BaseModule {
    initialize() {
        MenuProvider.registerMenuGroup({
            backstage: 'admin',
            icon: <Icon component={svgs.Admin} />,
            homePath: '/home',
            allow: () => token.userInfo.role == enums.IceRoleTypes.Admin,
            text: '管理端'
        });
        MenuProvider.registerMenu({
            name: 'home',
            icon: <HomeOutlined />,
            text: '首页',
            component: Home,
            menuItems: null
        }, 'admin', 0);

        MenuProvider.registerMenu({
            name: 'warehouse',
            icon: <ShopOutlined />,
            text: '仓库管理',
            component: Warehouse,
            allowAccess: () => token.userInfo.scope?.some(e => e == enums.IceResourceScopes.WMSScope) == true,
            menuItems: null
        }, 'admin', 1);

        MenuProvider.registerMenu({
            name: 'open-service',
            icon: <CloudServerOutlined />,
            text: '开通服务',
            component: OpenService,
            menuItems: null
        }, 'admin', 2);

        MenuProvider.registerMenu({
            name: 'recharge',
            text: '余额充值',
            icon: <MoneyCollectOutlined />,
            component: Recharge,
            menuItems: null
        }, 'admin', 5);

        MenuProvider.registerMenu({
            name: 'amount-adjust',
            text: '账单记录',
            icon: <FileSearchOutlined />,
            component: AmountAdjust,
            menuItems: null
        }, 'admin', 6);

        MenuProvider.registerMenu({
            name: 'base-info',
            text: '基本信息',
            icon: <KeyOutlined />,
            component: BaseInfo,
            menuItems: null
        }, 'admin', 7);

        MenuProvider.registerMenu({
            name: 'guest-blacklist',
            text: '访客黑名单',
            icon: <SolutionOutlined />,
            component: GuestBlacklist,
            menuItems: null
        }, 'admin', 8);
    }
}

const module = new Module();
export default module;

ModuleFactory.register(module, [CoreModule, LayoutModule]);
