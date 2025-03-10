import React from 'react';
import { BaseModule, ModuleFactory, PageProvider } from 'icetf';
import { Module as CoreModule, enums, svgs, configuration } from 'ice-core';
import { Module as LayoutModule, MenuProvider } from 'ice-layout';
import Icon, {
    CommentOutlined,
    DotChartOutlined,
    PieChartOutlined,
    FileSearchOutlined,
    QuestionOutlined,
    UnorderedListOutlined,
    HomeOutlined,
    SettingOutlined,
    FileProtectOutlined,
    TagsOutlined,
    FileTextOutlined,
    BarChartOutlined,
    QuestionCircleOutlined,
    EllipsisOutlined,
    NodeIndexOutlined,
    UserSwitchOutlined,
    DashboardOutlined
} from '@ant-design/icons';
import { token } from 'ice-common';

// 页面
import Home from './pages/Home';
import Gpt from './pages/Gpt';
import Chat from './pages/Chat';
import QAList from './pages/QAList';
import QA from './pages/QA';
import QAOfGuest from './pages/QAOfGuest';
import QAOnline from './pages/QAOnline';
import Questionnaire from './pages/Questionnaire';
import QuestionnaireResult from './pages/QuestionnaireResult';
import QaTag from './pages/QaTag';
import QuestionnaireStatistics from './pages/QuestionnaireStatistics';
import FocusQuestion from './pages/FocusQuestion';
import CsText from './pages/CsText';
import Docking from './pages/Docking';
import Client from './pages/Client';

// 后台初始化程序
import backInitFun from './backInitFun';

import AI from './parts/AI';

class Module extends BaseModule {
    initialize() {
        MenuProvider.registerMenuGroup({
            backstage: 'ai',
            icon: <Icon component={svgs.QA} />,
            text: 'AI问答/客服',
            homePath: '/dashboard/home',
            allow: () => token.userInfo.role == enums.IceRoleTypes.Admin && token.userInfo.scope?.some(e => e == enums.IceResourceScopes.AIScope) == true,
            initFun: backInitFun,
            defaultOpenNames: ['dashboard', 'chats', 'baseinfo', 'statistics', 'other'],
            // globalPart: <AI />
        });

        MenuProvider.registerMenu({
            name: 'dashboard',
            text: '仪表',
            icon: <DashboardOutlined />,
            menuItems: [{
                name: 'home',
                icon: <HomeOutlined />,
                text: '首页',
                component: Home,
                menuItems: null
            }]
        }, 'ai', 0);

        // MenuProvider.registerMenu({
        //     name: 'chat',
        //     icon: <Icon component={svgs.Chat} />,
        //     text: '聊天',
        //     component: Chat,
        //     menuItems: null
        // }, 'ai', 1);

        MenuProvider.registerMenu({
            name: 'chats',
            text: '问答',
            icon: <QuestionCircleOutlined />,
            menuItems: [{
                name: 'qa-online',
                icon: <Icon component={svgs.QA} />,
                text: '在线问答',
                component: QAOnline,
                menuItems: null
            }, {
                name: 'qa',
                icon: <QuestionOutlined />,
                text: '问答测试',
                component: QA,
                menuItems: null
            }]
        }, 'ai', 2);

        MenuProvider.registerMenu({
            name: 'baseinfo',
            text: '基本',
            icon: <FileTextOutlined />,
            menuItems: [{
                name: 'qa-list',
                icon: <UnorderedListOutlined />,
                text: '问答列表',
                component: QAList,
                menuItems: null
            }, {
                name: 'questionnaire',
                icon: <FileSearchOutlined />,
                text: '调查问卷',
                component: Questionnaire,
                menuItems: null
            }, {
                name: 'qa-tag',
                icon: <TagsOutlined />,
                text: '问卷标签',
                component: QaTag,
                menuItems: null
            }, {
                name: 'cs-text',
                icon: <CommentOutlined />,
                text: '客服话术',
                component: CsText,
                menuItems: null
            }, {
                name: 'client',
                icon: <UserSwitchOutlined />,
                text: '客户管理',
                component: Client,
                menuItems: null
            }]
        }, 'ai', 3);

        MenuProvider.registerMenu({
            name: 'statistics',
            text: '统计',
            icon: <BarChartOutlined />,
            menuItems: [{
                name: 'questionnaire-result',
                icon: <FileProtectOutlined />,
                text: '问卷结果',
                component: QuestionnaireResult,
                menuItems: null
            }, {
                name: 'questionnaire-statistics',
                icon: <PieChartOutlined />,
                text: '问卷统计',
                component: QuestionnaireStatistics,
                menuItems: null
            }, {
                name: 'focus-question',
                icon: <DotChartOutlined />,
                text: '访客关注内容',
                component: FocusQuestion,
                menuItems: null
            }]
        }, 'ai', 4);

        MenuProvider.registerMenu({
            name: 'other',
            text: '其他',
            icon: <EllipsisOutlined />,
            menuItems: [{
                name: 'gpt',
                text: 'AI 设置',
                icon: <SettingOutlined />,
                component: Gpt,
                menuItems: null
            },{
                name: 'docking',
                text: '接入客服',
                icon: <NodeIndexOutlined />,
                component: Docking,
                menuItems: null
            }]
        }, 'ai', 10);

        PageProvider.register({
            name: 'QAOfGuest',
            url: `${configuration.pcRouterPre}/qa-of-guest`,
            element: <QAOfGuest />
        });
    }
}

const module = new Module();
export default module;

ModuleFactory.register(module, [CoreModule]);
