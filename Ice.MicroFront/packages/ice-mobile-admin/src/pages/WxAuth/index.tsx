import React from 'react';
import { Button, Toast } from 'antd-mobile';
import { wx } from 'ice-mobile-layout';
import { iceFetch, Tool } from 'ice-common';
//@ts-ignore
import AuthImg from './auth.svg';
//@ts-ignore
import SuccessImg from './success.svg';
import {
    LeftOutline
} from 'antd-mobile-icons';
import { useNavigate } from 'react-router';

class WxAuth extends React.Component<{
    navigate: (url: any) => void
}> {
    state = {
        success: false,
        loading: false,
    }

    componentDidMount(): void {
        let code = Tool.getUrlVariable(window.location.search || '', 'code');
        let state = Tool.getUrlVariable(window.location.search || '', 'state');

        // code 没有值为刚进入当前页面，有值则为微信回调
        if (!code) {
            return;
        }

        // 插入一个测试点
        if (state?.startsWith('-test-')) {
            return;
        }

        // 如果code有值，则为刚授权重定向回来
        if (code) {
            this.fetchBindUser(code);
            return;
        }
    }

    // 点击授权
    onAuth = () => {
        window.location.href = wx.getAuthorizeUrl(window.location.origin + window.location.pathname);
    }

    fetchBindUser = (code: string) => {
        this.setState({ loading: true });
        iceFetch(`/api/auth/wx/bind-user`, {
            method: 'POST',
            body: JSON.stringify({
                code: code
            })
        }).then(() => {
            this.setState({ success: true });
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    render() {
        return <div className='h-full flex flex-col'>
            <div className='bg-white p-4 text-xl shadow-sm'
                onClick={() => {
                    this.props.navigate(-1);
                }}
            >
                <LeftOutline />
                <span className='ml-4'>返回</span>
            </div>
            <div className='flex flex-col grow items-center justify-center p-8'>
                {
                    !this.state.success &&
                    <>
                        <img style={{ width: '100%', marginBottom: 10 }} src={AuthImg} />
                        <div className='text-center mb-4'>你即将授权小冰进行身份验证，我们将会获取你的个人信息，包括你的昵称，头像，国家等。</div>
                        <Button color='primary' block loading={this.state.loading} onClick={this.onAuth}>绑定微信</Button>
                    </>
                }
                {
                    this.state.success &&
                    <>
                        <img style={{ width: '100%', marginBottom: 10 }} src={SuccessImg} />
                        <div style={{ marginBottom: 10 }}>绑定成功</div>
                    </>
                }
            </div>
        </div>
    }
}

export default () => {
    const nav = useNavigate();
    return <WxAuth
        navigate={nav}
    />
};;