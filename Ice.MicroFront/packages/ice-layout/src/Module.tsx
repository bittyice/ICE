import React from 'react';
import { BaseModule, ModuleFactory, PageProvider } from 'icetf';
import { Module as CoreModule, configuration } from 'ice-core';
import { Navigate } from 'react-router';

// 页面
import Layout from './pages/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgetPassword from './pages/ForgetPassword';

class Module extends BaseModule {
    initialize() {
        PageProvider.register({
            name: "Home",
            url: '/',
            element: <Navigate to={`${configuration.pcRouterPre}/login/admin`} />
        });
        PageProvider.register({
            name: "Home",
            url: configuration.pcRouterPre,
            element: <Navigate to={`${configuration.pcRouterPre}/login/admin`} />
        });
        PageProvider.register({
            name: 'login',
            url: `${configuration.pcRouterPre}/login/:backstage`,
            element: <Login />
        });
        PageProvider.register({
            name: 'register',
            url: `${configuration.pcRouterPre}/register`,
            element: <Register />
        });
        PageProvider.register({
            name: 'forget-password',
            url: `${configuration.pcRouterPre}/forget-password`,
            element: <ForgetPassword />
        });
        PageProvider.register({
            name: 'back',
            url: `${configuration.pcRouterPre}/back/:backstage/*`,
            element: <Layout />
        });
    }
}

const module = new Module();
export default module;

ModuleFactory.register(module, [CoreModule]);
