import React, { useEffect, useState } from "react";
import { UserOutlined, ArrowRightOutlined, LockOutlined, EllipsisOutlined, UserAddOutlined, WechatOutlined, MailOutlined, ArrowLeftOutlined, LoginOutlined, WechatFilled } from '@ant-design/icons';
import { Storage, Tool, iceFetch, token } from 'ice-common';
import { useLocation, useNavigate, useParams } from 'react-router';
import MenuProvider from '../../menu/MenuProvider';
import { configuration, svgs } from 'ice-core';
import { SendOutline } from 'antd-mobile-icons';
import { Button, Checkbox, Divider, Input, Space, TabBar, Avatar, SafeArea, Result, Toast, Form } from 'antd-mobile';

// @ts-ignore
import bgimg from '../../statics/bg.jpg';
// @ts-ignore
import logo from '../../statics/logo.png';

import './index.css';
import wx from "../../wx";

const PasswordBox = () => {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const location = useLocation();
    const nav = useNavigate();

    const onCommit = async () => {
        if (!username) {
            Toast.show('请输入用户名');
            return;
        }

        if (!password) {
            Toast.show('请输入密码');
            return;
        }

        setLoading(true);
        try {
            let tokenStr = await iceFetch<string>('/api/auth/account/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            token.setToken(tokenStr);

            let backurl = Tool.getUrlVariable(location.search, 'backurl');
            // 如果又回调地址则直接跳转回调地址
            if (backurl) {
                backurl = decodeURIComponent(backurl);
                nav(backurl, { replace: true });
                return;
            }

            // 跳转后台
            nav(MenuProvider.getHomeUrl());
        }
        catch (ex) {
            Toast.show(ex.responseData?.error?.message);
        }

        setLoading(false);
    }

    return <div className="flex flex-col justify-center rounded-md p-8 border relative w-full pl-20 pr-20">
        <div className='flex items-center mb-16'>
            <img src={logo} style={{ width: 30, height: 30, marginRight: 10 }} />
            <span className="text-2xl font-semibold themebg-r"
                style={{
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                }}
            >小 冰</span>
            <div style={{ flexGrow: 1 }}></div>
            <div className="text-lg font-semibold">嘿！赶紧登录吧！</div>
        </div>
        <Form layout='horizontal' style={{
            '--prefix-width': '2rem'
        }}>
            <Form.Item label={<UserOutlined />} name='username'>
                <Input placeholder='手机号'
                    value={username}
                    onChange={(e) => {
                        setUsername(e);
                    }}
                    onEnterPress={(event) => {
                        onCommit();
                    }}
                />
            </Form.Item>
            <Form.Item label={<LockOutlined />} name='password'>
                <Input placeholder='密码'
                    type='password'
                    value={password}
                    onChange={(e) => {
                        setPassword(e);
                    }}
                    onEnterPress={(event) => {
                        onCommit();
                    }}
                />
            </Form.Item>
        </Form>

        <div className="flex justify-end mb-8 mt-6">
            <Button loading={loading} onClick={() => {
                nav(`${configuration.mobileRouterPre}/register`);
            }} className="shrink-0" shape='rounded' fill='none'><UserAddOutlined /><span className="ml-2">注册</span></Button>
        </div>
        <div className="flex mb-4 gap-2">
            <Button shape='rounded' loading={loading} onClick={onCommit} color='primary' block><LoginOutlined /><span className="ml-2">登录</span></Button>
        </div>
        <Divider>第三方登录</Divider>
        <div className="flex justify-center gap-12">
            <div className="text-3xl text-green-500"
                onClick={() => {
                    // nav(`${configuration.mobileRouterPre}/wx-login`);
                    window.location.href = wx.getAuthorizeUrl(window.location.origin + `${configuration.mobileRouterPre}/wx-login`);
                }}
            >
                <WechatOutlined />
            </div>
            <div className="text-3xl bg-gray-300 rounded-full flex justify-center items-center text-white" style={{ height: '2.25rem', width: '2.25rem' }}
            >
                <EllipsisOutlined />
            </div>
        </div>
    </div>;
};

const Login = () => {
    const [notfind, setNotfind] = useState(false);
    const param = useParams();

    useEffect(() => {
        let backstage = param.backstage;
        if (!backstage) {
            setNotfind(true);
            return;
        }
        if (!MenuProvider.isExistMenuGroup(backstage)) {
            setNotfind(true);
            return;
        }
        MenuProvider.backstage = backstage;
    }, []);

    return <div className="w-full h-full flex justify-center items-center">
        {
            notfind && <Result
                title="404"
            />
        }
        {
            !notfind && <PasswordBox />
        }
    </div>;
}

export default Login;