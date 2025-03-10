import React from 'react';
import { iceFetch, Tool, token } from 'ice-common';
import { useNavigate } from 'react-router';
import MenuProvider from '../../menu/MenuProvider';
import { DotLoading, Button } from 'antd-mobile';
import { configuration } from 'ice-core';

class WxAuth extends React.Component<{
    navigate: (url: any, options?: any) => void
}> {
    state = {
        success: null as boolean | null,
        error: null as string | null,
    }

    componentDidMount(): void {
        let code = Tool.getUrlVariable(window.location.search || '', 'code');

        if (!code) {
            this.setState({ success: false, error: '未找到授权码' });
            return;
        }

        this.fetchLogin(code);
    }

    fetchLogin = (code: string) => {
        this.setState({ loading: true });
        iceFetch<string>(`/api/auth/account/wx-login`, {
            method: 'POST',
            body: JSON.stringify({
                code: code
            })
        }).then((tokenStr) => {
            token.setToken(tokenStr);
            this.setState({ success: true });
            this.props.navigate(MenuProvider.getHomeUrl());
        }).catch(ex => {
            this.setState({ success: false, error: ex.responseData?.error?.message });
        }).finally(() => {
        });
    }

    render() {
        return <div className='h-full flex justify-center items-center'>
            {
                this.state.success === null ?
                    <DotLoading color='primary' />
                    : this.state.success === false ?
                        <div className='flex flex-col gap-4 items-center'>
                            <div className='text-2xl font-semibold'>微信登录失败</div>
                            <div>{this.state.error}</div>
                            <div>
                                <Button
                                    block
                                    color='primary'
                                    onClick={() => this.props.navigate(`${configuration.mobileRouterPre}/login/admin`, { replace: true })}
                                >返回登录页</Button>
                            </div>
                        </div>
                        : null
            }
        </div>
    }
}

export default () => {
    const nav = useNavigate();
    MenuProvider.backstage = 'admin';
    return <WxAuth
        navigate={nav}
    />
};;