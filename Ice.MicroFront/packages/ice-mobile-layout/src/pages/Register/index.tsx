import React, { useEffect, useState, useRef } from "react";
import { Space, Input, Button, Divider, Toast, Form } from 'antd-mobile';
import { UserOutlined, ArrowRightOutlined, LockOutlined, SafetyOutlined, UserAddOutlined, WechatOutlined, MailOutlined, ArrowLeftOutlined, LoginOutlined } from '@ant-design/icons';
import { Storage, Tool, iceFetch, token } from 'ice-common';
import { useLocation, useNavigate, useParams } from 'react-router';
import MenuProvider from '../../menu/MenuProvider';

// @ts-ignore
import bgimg from '../../statics/bg.jpg';
// @ts-ignore
import logo from '../../statics/logo.png';
import FontVerifyCode from "../../components/FontVerifyCode";
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
            Toast.show("请输入手机号");
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

            Toast.show("短信发送成功");
        }
        catch (ex) {
            Toast.show(ex.responseData?.error?.message);
            setVerifyCodeKey(verifyCodeKey + 1);
            return;
        }

        setOpenVerify(false);
    }

    const onCommit = async () => {
        if (!phone) {
            Toast.show("请输入手机号");
            return;
        }

        if (!password) {
            Toast.show("请输入密码");
            return;
        }

        if (password != cpassword) {
            Toast.show("两次输入的密码不一致");
            return;
        }

        if (!code) {
            Toast.show("请输入验证码");
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

            Toast.show("注册成功，已为你返回登录页面");
            // 跳转后台
            nav(`${configuration.mobileRouterPre}/login/admin`);
        }
        catch (ex) {
            Toast.show(ex.responseData?.error?.message);
        }

        setLoading(false);
    }

    return <div className="flex w-full h-full justify-center items-center">
        <div className="flex flex-col w-full pl-20 pr-20">
            <div className='flex items-center mb-16'>
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
                <div className="text-lg font-semibold">嘿！赶紧注册吧！</div>
            </div>

            <Form layout='horizontal' style={{
                '--prefix-width': '30px'
            }}>
                <Form.Item label={<UserOutlined />}>
                    <Input placeholder='请输入手机号'
                        value={phone}
                        onChange={(e) => {
                            setPhone(e);
                        }}
                    />
                </Form.Item>
                <Form.Item label={<LockOutlined />}>
                    <Input placeholder='密码'
                        type='password'
                        value={password}
                        onChange={(e) => {
                            setPassword(e);
                        }}
                    />
                </Form.Item>
                <Form.Item label={<LockOutlined />}>
                    <Input placeholder='确认密码'
                        type='password'
                        value={cpassword}
                        onChange={(e) => {
                            setCPassword(e);
                        }}
                    />
                </Form.Item>
                <Form.Item label={<SafetyOutlined />}>
                    <div className="flex">
                        <Input placeholder='请输入验证码'
                            value={code}
                            onChange={(e) => {
                                setCode(e);
                            }}
                            onEnterPress={onCommit}
                        />
                        <Button className="shrink-0" size='small' fill='none'
                            onClick={() => {
                                if (!phone) {
                                    Toast.show('请输入手机号');
                                    return;
                                }
                                setVerifyCodeKey(verifyCodeKey + 1);
                                setOpenVerify(true);
                            }}
                        >发送</Button>
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
                </Form.Item>
            </Form>

            <div className="flex justify-center mt-16">
                <Button loading={loading} onClick={onCommit} color='primary' shape='rounded' block>
                    <UserAddOutlined /><span className="ml-2">注册</span>
                </Button>

            </div>

            <div className="flex justify-end mt-4">
                <Button className="shrink-0" onClick={() => {
                    nav(`${configuration.mobileRouterPre}/login/admin`);
                }} fill='none'><LoginOutlined /><span className="ml-2">登录</span></Button>
            </div>
        </div>
    </div>;
}

export default Register;