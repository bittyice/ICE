import React, { useEffect, useRef, useState } from "react";
import { Col, Select, Space, Input, Button, Checkbox, Divider, Image, message, Popover, Typography, notification, Result } from 'antd';
import { UserOutlined, ArrowRightOutlined, LockOutlined, CloudServerOutlined, AlipayCircleOutlined, WechatOutlined, MailOutlined, ArrowLeftOutlined, LoginOutlined } from '@ant-design/icons';
import { Storage, Tool, iceFetch, token } from 'ice-common';
import { useLocation, useNavigate, useParams } from 'react-router';
import MenuProvider from '../../menu/MenuProvider';
import { configuration, svgs } from 'ice-core';

// @ts-ignore
import bgimg from '../../statics/bg.jpg';
// @ts-ignore
import logo from '../../statics/logo.png';

import './index.css';
import Footer from "../../components/Footer";

const MessageContent = (props: { text: string }) => {
    return <div className="flex items-center">
        <div className="flex justify-center items-center w-10 h-10 mr-2 text-green-600">
            <svgs.OpenAI width={20} height={20} />
        </div>
        <div>{props.text}</div>
    </div>
}

const printText = "联系我们：13637513897， 微信号：13637513897";
const ContentInfo = () => {
    const [n, setN] = useState(0);
    const [show_, setShow_] = useState(false);

    useEffect(() => {
        let num = 0;
        const h = setInterval(() => {
            if (num < (printText.length)) {
                num++;
                setN(num);
            }
        }, 200);

        let show = false;
        const h2 = setInterval(() => {
            show = !show;
            setShow_(show);
        }, 300);

        return () => {
            clearInterval(h);
            clearInterval(h2);
        }
    }, []);

    return <div>
        <div className="themebg-r shadow-md" style={{
            padding: 15,
            borderRadius: 10,
        }}>
            <div
                className="flex flex-col gap-3"
                style={{
                    boxShadow: '#1c000060 0px 0px 2px inset',
                    backgroundColor: '#00000040',
                    color: '#fff',
                    padding: 15,
                    borderRadius: 10
                }}>
                <MessageContent text="欢迎使用小冰系统" />
                <MessageContent text="我们提供了AI客服，进销存，仓库管理等功能，注册即可使用" />
                <MessageContent text="计费方式可以去我们官网查看哦" />
                <MessageContent text="同时我们提供定制开发服务" />
                <MessageContent text={printText.substring(0, n) + (show_ ? '_' : '')} />
            </div>
        </div>
        <div className="login-content-info-footer" style={{}}>
            <div style={{}}>
                <span style={{ marginRight: 5 }}>已对接</span>
                <ArrowRightOutlined />
            </div>
            <div style={{ fontSize: 18 }}>
                <WechatOutlined />
            </div>
            <div style={{ fontSize: 18 }}>
                <AlipayCircleOutlined />
            </div>
            <div style={{ fontSize: 12 }}>
                40+快递服务商
            </div>
            <div style={{ marginLeft: 'auto' }}>
                <ArrowLeftOutlined />
                <span style={{ marginLeft: 5 }}>对接中</span>
            </div>
        </div>
    </div>
}

const PasswordBox = () => {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const location = useLocation();
    const nav = useNavigate();

    const onCommit = async () => {
        if (!username) {
            message.error('请输入用户名');
            return;
        }

        if (!password) {
            message.error('请输入密码');
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
            message.error(ex.responseData?.error?.message);
        }

        setLoading(false);
    }

    return <div className="flex flex-col justify-center rounded-md p-8 text-white shadow-md themebg"
        style={{
            width: 320
        }}
    >
        <div className='flex items-center mb-2'>
            <img src={logo} style={{ width: 30, height: 30, marginRight: 10 }} />
            <span className="text-2xl font-semibold text-white"
                style={{
                    background: 'linear-gradient(to right,#ef96c5,#ccfbff)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                }}
            >小 冰</span>
            <div style={{ flexGrow: 1 }}></div>
        </div>

        <Divider />

        <Space direction='vertical' style={{ width: '100%' }}>
            <div>
                <Input size='large' placeholder='手机号' prefix={<UserOutlined />}
                    className='login-box-input'
                    value={username}
                    onChange={(e) => {
                        setUsername(e.currentTarget.value);
                    }}
                    onKeyDown={(event) => {
                        if (event.code == 'Enter') {
                            onCommit();
                        }
                    }}
                />
            </div>
            <div style={{ marginTop: 8 }}>
                <Input.Password size='large' placeholder='密码' prefix={<LockOutlined />}
                    className='login-box-input'
                    type='password'
                    value={password}
                    onChange={(e) => {
                        setPassword(e.currentTarget.value);
                    }}
                    onKeyDown={(event) => {
                        if (event.code == 'Enter') {
                            onCommit();
                        }
                    }}
                />
            </div>
            <div className="flex justify-between items-center mt-4 pl-4">
                <Checkbox style={{ color: '#fff' }} checked>记住我？</Checkbox>
                <Button className="text-white" type='ghost' size='small'
                    onClick={() => {
                        nav(`${configuration.pcRouterPre}/forget-password`);
                    }}
                >
                    忘记密码？
                </Button>
            </div>
        </Space>

        <Divider />

        <div className="flex justify-center mb-4">
            <Button size='large' loading={loading} onClick={onCommit} type='primary' icon={<LoginOutlined />} block>登录</Button>
            <Button size='large' style={{ marginLeft: 5 }} onClick={() => {
                nav(`${configuration.pcRouterPre}/register`);
            }}>注册</Button>
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

    return <div className="w-full h-full flex justify-center items-center" style={{
        background: `url(${bgimg})`,
        backgroundSize: 'cover',
        backgroundPosition: '50% 50%',
    }}>
        {
            notfind && <Result
                status="404"
                title="404"
                subTitle="无效的网址，请检查并重新输入网址！"
            />
        }
        {
            !notfind && <>
                <div className="mr-10" style={{ width: 500 }}>
                    <ContentInfo />
                </div>
                <PasswordBox />
                <Footer />
            </>
        }
    </div>;
}

export default Login;