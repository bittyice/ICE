import React, { useEffect, useState } from 'react';
import { Button, SearchBar, Divider, TabBar, Avatar, SafeArea, Tabs, Toast } from 'antd-mobile';
import './index.css';
import MenuProvider from '../../menu/MenuProvider';
import { Route, Routes, useNavigate, useParams, useLocation } from 'react-router';
//@ts-ignore
import LogoImg from '../../statics/logo.png';
import { configuration, globalSlice } from 'ice-core';
import { useDispatch } from 'react-redux';
import { iceFetchCallBack, token } from 'ice-common';

const DefaultHeader = (props: {
    onLoginClick: () => void,
    onAvatarClick: () => void
}) => {
    return <div className='layout-top'>
        <div className='layout-top-sereach'>
            <div style={{ height: 22, borderRight: '1px solid #cacaca', paddingRight: 10 }} >
                <img src={LogoImg} style={{ height: '100%' }} />
            </div>
            <div>
                <SearchBar
                    placeholder='请输入搜索值'
                    style={{
                        '--background': '#fff0',
                        '--border-radius': '100px',
                        borderWidth: 0
                    }}
                />
            </div>
        </div>
        <div style={{ margin: '0px 10px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <div onClick={props.onAvatarClick}>
                <Avatar
                    style={{
                        '--size': '30px',
                        '--border-radius': '30px'
                    }} src=''
                />
            </div>
        </div>
    </div>
}

class Layout extends React.Component<{
    pathname: string,
    navigate: (url: string, options?: any) => void,
}> {
    render(): React.ReactNode {
        var menuGroupInfo = MenuProvider.menuGroupInfos.find(e => e.backstage == MenuProvider.backstage)!;
        const menus = MenuProvider.getMenus().filter(e => e.component);

        return <div className='layout'>
            <div>
                <SafeArea position='top' />
            </div>
            {
                menuGroupInfo.showMenuTabs !== false &&
                <Tabs
                    style={{
                        '--title-font-size': '13px',
                    }}
                    onChange={key => {
                        const menu = menus.find(e => e.name == key)!;
                        this.props.navigate(menu.url);
                    }}
                >
                    {
                        menus.filter(e => !e.hidden).map(item => {
                            return <Tabs.Tab title={item.text} key={item.name}></Tabs.Tab>
                        })
                    }
                </Tabs>
            }
            <div className='layout-body'>
                <Routes>
                    {
                        menus.map(item => {
                            let Component = item.component!;
                            return <Route key={item.name} path={item.name} element={<Component />} />
                        })
                    }
                </Routes>
            </div>
            <div>
                <TabBar
                    className='pt-2 pb-1'
                    safeArea
                    activeKey={MenuProvider.backstage}
                    onChange={(key) => {
                        this.props.navigate(MenuProvider.getHomeUrl(key));
                    }}
                >
                    {
                        MenuProvider.menuGroupInfos.map(item => {
                            return <TabBar.Item key={item.backstage} icon={item.icon} title={item.text} />
                        })
                    }
                </TabBar>
            </div>
        </div>
    }
}

export default () => {
    const [init, setInit] = useState(false);
    const nav = useNavigate();
    const params = useParams();
    const location = useLocation();
    const dispatch = useDispatch();

    MenuProvider.backstage = params.backstage as any;

    const initFun = async () => {
        await Promise.all([
            dispatch(globalSlice.asyncActions.fetchTenant({}) as any),
            dispatch(globalSlice.asyncActions.fetchUser({}) as any)
        ]);
        setInit(true);
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
                nav(`${configuration.mobileRouterPre}/login/${MenuProvider.backstage}`);
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
            Toast.show(error);
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

    return <Layout
        pathname={location.pathname}
        navigate={nav}
    />
};