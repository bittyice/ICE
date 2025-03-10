import React from 'react';
import { BaseModule, ModuleFactory, PageProvider } from 'icetf';
import { Module as CoreModule, enums, svgs, configuration } from 'ice-core';
import { Navigate } from 'react-router';

// 页面
import Layout from './pages/Layout';

// 菜单页
import NoContent from './pages/NoContent';
import Login from './pages/Login';
import WxLogin from './pages/WxLogin';
import Register from './pages/Register';

class Module extends BaseModule {
    initialize() {
        PageProvider.register({
            name: 'back',
            url: `${configuration.mobileRouterPre}/back/:backstage/*`,
            element: <Layout />
        });
        PageProvider.register({
            name: 'login',
            url: `${configuration.mobileRouterPre}/login/:backstage`,
            element: <Login />
        });
        PageProvider.register({
            name: 'register',
            url: `${configuration.mobileRouterPre}/register`,
            element: <Register />
        });
        PageProvider.register({
            name: 'wx-login',
            url: `${configuration.mobileRouterPre}/wx-login`,
            element: <WxLogin />
        });
        PageProvider.register({
            name: 'Home',
            url: `${configuration.mobileRouterPre}`,
            element: <Navigate to={`${configuration.mobileRouterPre}/login/admin`} />
        });
    }
}

const module = new Module();
export default module;

ModuleFactory.register(module, [CoreModule]);
