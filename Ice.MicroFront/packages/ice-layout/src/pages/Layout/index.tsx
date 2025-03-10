import React, { useEffect, useState } from 'react';
import { Layout, message, notification } from 'antd';
import SiderMenu from './SiderMenu';
import RightSider from './RightSider';
import ContentEX from './Content';
import { useParams, useNavigate } from 'react-router-dom';
import { iceFetchCallBack, token } from 'ice-common';
import { IceStateType, configuration, globalSlice } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';

import MenuProvider from '../../menu/MenuProvider';
import Loading from './Loading';
import Head from './Head';

import './index.css';

const { Sider, Content, Footer } = Layout;

// 针对各个后台的Layout，当切换路由时会重新加载该组件
const LayoutOfBack = () => {
    const [init, setInit] = useState(false);

    const initFun = async () => {
        let menuGroupInfo = MenuProvider.getCurMenuGroupInfo();
        if (!!menuGroupInfo?.initFun) {
            try {
                await menuGroupInfo.initFun();
            }
            catch (ex) {
                notification.error({
                    message: `进入 ${menuGroupInfo.text} 出错`,
                    description: ex.message,
                    duration: null
                });
                return;
            }
        }
        setInit(true);
    }

    useEffect(() => {
        initFun();
    }, []);

    return <Content className='flex-grow overflow-y-auto relative ice-scrollbar-bgwhite p-4'>
        {
            init && <ContentEX />
        }
    </Content>
}

// 针对全局的Layout，当切换路由时不会重新加载该组件
const LayoutOfGlobal = () => {
    const [init, setInit] = useState(false);
    const params = useParams();
    const nav = useNavigate();
    const dispatch = useDispatch();

    MenuProvider.backstage = params.backstage as any;

    const initFun = async () => {
        // 请求当前租户数据
        await Promise.all([
            dispatch(globalSlice.asyncActions.fetchTenant({}) as any),
            dispatch(globalSlice.asyncActions.fetchUser({}) as any)
        ]);
        setInit(true);
        // 查看用户是否有权限进入当前后台
        const menuGroupInfo = MenuProvider.menuGroupInfos.find(e => e.backstage === MenuProvider.backstage);
        if (menuGroupInfo?.allow && !menuGroupInfo.allow()) {
            nav(`${MenuProvider.preRoute}/admin/home`, { replace: true });
            return;
        }
    }

    useEffect(() => {
        initFun();

        // 注册 fetch 回调函数
        const catchfun = (params: {
            input: string,
            init: RequestInit | undefined,
            ex: any,
            fetchSign: number
        }) => {
            if (params.ex.status == 401) {
                token.clearToken();
                nav(`${configuration.pcRouterPre}/login/${MenuProvider.backstage}`);
                return;
            }

            let error: string;
            let validationErrors = params.ex.responseData?.error?.validationErrors;
            if (validationErrors) {
                error = validationErrors[0]?.message;
            }
            else {
                error = params.ex.responseData?.error?.message;
            }
            message.error(error);
        }

        iceFetchCallBack.catchs.push(catchfun);

        return () => {
            let index = iceFetchCallBack.catchs.findIndex(e => e == catchfun);
            iceFetchCallBack.catchs.splice(index, 1);
        }
    }, []);

    if (!init) {
        return <></>;
    }

    return <Layout className="back-layout h-screen w-screen overflow-hidden">
        <Sider
            theme='dark'
            width={220}
            className="h-full"
        >
            <SiderMenu />
        </Sider>
        <Layout style={{ position: 'relative' }}>
            <Head />
            <LayoutOfBack key={params.backstage} />
            <div className='absolute z-10 w-10 h-10 bottom-4 left-4'>
                <Loading />
            </div>
        </Layout>
        <RightSider />
    </Layout>
}

export default () => {
    const layoutKey = useSelector((state: IceStateType) => state.global.layoutKey);
    return <LayoutOfGlobal
        key={layoutKey}
    />
};