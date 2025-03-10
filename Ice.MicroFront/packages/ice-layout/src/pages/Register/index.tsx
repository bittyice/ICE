import React, { useEffect, useState, useRef } from "react";
import { Col, Spin, Space, Input, Button, Tag, Divider, Image, message, Popover, Typography, notification, Modal } from 'antd';
import { UserOutlined, ArrowRightOutlined, LockOutlined, SafetyOutlined, AlipayCircleOutlined, WechatOutlined, MailOutlined, ArrowLeftOutlined, LoginOutlined } from '@ant-design/icons';
import { Storage, Tool, iceFetch, token } from 'ice-common';
import { useLocation, useNavigate, useParams } from 'react-router';
import MenuProvider from '../../menu/MenuProvider';

// @ts-ignore
import bgimg from '../../statics/bg.jpg';
// @ts-ignore
import logo from '../../statics/logo.png';
import FontVerifyCode from "../../components/FontVerifyCode";
import Footer from "../../components/Footer";
import { configuration } from "ice-core";

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [cpassword, setCPassword] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [verifyCodeKey, setVerifyCodeKey] = useState<number>(0);
    const [openVerify, setOpenVerify] = useState<boolean>(false);
    const location = useLocation();
    const nav = useNavigate();

    const fetchSms = async (params: {
        sign: string,
        clickPositions: Array<{ x: number, y: number }>
    }) => {
        if (!phone) {
            message.error('请输入手机号');
            return;
        }

        try {
            await iceFetch<string>('/api/auth/account/send-register-sms', {
                method: 'POST',
                body: JSON.stringify({
                    phone: phone,
                    verificationCodeSign: params.sign,
                    position: params.clickPositions
                })
            });

            message.success('短信发送成功');
        }
        catch (ex) {
            message.error(ex.responseData?.error?.message);
            setVerifyCodeKey(verifyCodeKey + 1);
            return;
        }

        setOpenVerify(false);
    }

    const onCommit = async () => {
        if (!phone) {
            message.error('请输入手机号');
            return;
        }

        if (!password) {
            message.error('请输入密码');
            return;
        }

        if (password != cpassword) {
            message.error('两次输入的密码不一致');
            return;
        }

        if (!code) {
            message.error('请输入验证码');
            return;
        }

        setLoading(true);
        try {
            await iceFetch('/api/auth/account/register', {
                method: 'POST',
                body: JSON.stringify({
                    phone: phone,
                    password: password,
                    smsCode: code
                })
            });

            message.success("注册成功，已为你返回登录页面");
            // 跳转后台
            nav(`${configuration.pcRouterPre}/login/admin`);
        }
        catch (ex) {
            message.error(ex.responseData?.error?.message);
        }

        setLoading(false);
    }

    return <div className="w-full h-full">
        <div className="w-full h-full flex justify-center items-center" style={{
            background: `url(${bgimg})`,
            backgroundSize: 'cover',
            backgroundPosition: '50% 50%',
        }}>
            <div className="flex items-start">
                <div className="flex flex-col justify-center rounded-md p-8 text-white shadow-md themebg"
                    style={{
                        width: 320
                    }}
                >
                    <div className='flex items-center mb-2'>
                        <img src={logo} style={{ width: 30, height: 30, marginRight: 10 }} />
                        <span className="text-2xl font-semibold"
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
                            <Input size='large' placeholder='请输入手机号' prefix={<UserOutlined />}
                                className='login-box-input'
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.currentTarget.value);
                                }}
                                onKeyDown={(event) => {
                                    if (event.code == 'Enter') {
                                        onCommit();
                                    }
                                }}
                            />
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <Input.Password size='large' placeholder='请输入密码' prefix={<LockOutlined />}
                                className='login-box-input'
                                autoComplete="new-password"
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
                        <div style={{ marginTop: 8 }}>
                            <Input.Password size='large' placeholder='请再次输入密码' prefix={<LockOutlined />}
                                className='login-box-input'
                                autoComplete="new-password"
                                type='password'
                                value={cpassword}
                                onChange={(e) => {
                                    setCPassword(e.currentTarget.value);
                                }}
                                onKeyDown={(event) => {
                                    if (event.code == 'Enter') {
                                        onCommit();
                                    }
                                }}
                            />
                        </div>
                        <div style={{ marginTop: 8 }}>

                            <Input size='large' placeholder='请输入验证码' prefix={<SafetyOutlined />}
                                suffix={<Button type='text' size='small'
                                    onClick={() => {
                                        if (!phone) {
                                            message.error('请输入手机号');
                                            return;
                                        }
                                        setVerifyCodeKey(verifyCodeKey + 1);
                                        setOpenVerify(true);
                                    }}
                                >发送验证码</Button>}
                                className='login-box-input'
                                value={code}
                                onChange={(e) => {
                                    setCode(e.currentTarget.value);
                                }}
                                onKeyDown={(event) => {
                                    if (event.code == 'Enter') {
                                        onCommit();
                                    }
                                }}
                            />
                            {
                                verifyCodeKey > 0 &&
                                <FontVerifyCode
                                    key={verifyCodeKey}
                                    open={openVerify}
                                    onCancel={() => {
                                        setOpenVerify(false);
                                    }}
                                    onOk={fetchSms}
                                />
                            }
                        </div>
                    </Space>

                    <Divider />

                    <div className="flex justify-center mt-4">
                        <Button size='large' loading={loading} onClick={onCommit} type='primary' block>注册</Button>
                        <Button size='large' style={{ marginLeft: 5 }} onClick={() => {
                            nav(`${configuration.pcRouterPre}/login/admin`);
                        }}>登录</Button>
                    </div>
                </div>
            </div>

        </div>
        <Footer />
    </div>;
}

export default Register;