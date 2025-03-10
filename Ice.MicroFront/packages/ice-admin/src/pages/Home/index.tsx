import React from 'react';
import { enums, svgs } from 'ice-core';
import Icon, { SnippetsOutlined, BankOutlined } from '@ant-design/icons';
import { Divider, Button, notification } from 'antd';
import { useNavigate } from 'react-router';
import { MenuProvider } from 'ice-layout';
import { token } from 'ice-common';

export default () => {
    const nav = useNavigate();

    return <div>
        <div className='bg-white rounded-md p-4'>
            <div className='text-xl font-semibold'>快捷导航</div>
            <div className='flex gap-4 mt-4'>
                <div className='w-32 h-32 bg-blue-500 rounded-md text-white flex flex-col justify-center items-center cursor-pointer'
                    onClick={() => {
                        if (token.userInfo.role == enums.IceRoleTypes.Admin && token.userInfo.scope?.some(e => e == enums.IceResourceScopes.AIScope) == true) {
                            nav(`${MenuProvider.preRoute}/ai/home`);
                            return;
                        }
                        notification.warning({
                            message: '请先开通"AI问答/客服"服务！',
                            description: <div>
                                <span>你需要先开通"AI问答/客服"服务</span>
                                <Button type='link' onClick={() => {
                                    nav(`${MenuProvider.preRoute}/admin/open-service`);
                                }}>去开通</Button>
                            </div>,
                            duration: 10,
                        })
                    }}
                >
                    <Icon className='text-6xl' component={svgs.QA} />
                    <div className='mt-2'>AI客服</div>
                </div>
                <div className='w-32 h-32 bg-green-500 p-6 rounded-md text-white flex flex-col justify-center items-center cursor-pointer'
                    onClick={() => {
                        if (token.userInfo.role == enums.IceRoleTypes.Admin && token.userInfo.scope?.some(e => e == enums.IceResourceScopes.PSIScope) == true) {
                            nav(`${MenuProvider.preRoute}/psi/dashboard/home`);
                            return;
                        }
                        notification.warning({
                            message: '请先开通"进销存"服务！',
                            description: <div>
                                <span>你需要先开通"进销存"服务</span>
                                <Button type='link' onClick={() => {
                                    nav(`${MenuProvider.preRoute}/admin/open-service`);
                                }}>去开通</Button>
                            </div>,
                            duration: 10,
                        })
                    }}
                >
                    <SnippetsOutlined className='text-6xl' />
                    <div className='mt-2'>进销存</div>
                </div>
                <div className='w-32 h-32 bg-green-500 p-6 rounded-md text-white flex flex-col justify-center items-center cursor-pointer'
                    onClick={() => {
                        if (token.userInfo.role == enums.IceRoleTypes.Admin && token.userInfo.scope?.some(e => e == enums.IceResourceScopes.WMSScope) == true) {
                            nav(`${MenuProvider.preRoute}/wms/dashboard/home`);
                            return;
                        }
                        notification.warning({
                            message: '请先开通"仓库管理"服务！',
                            description: <div>
                                <span>你需要先开通"仓库管理"服务</span>
                                <Button type='link' onClick={() => {
                                    nav(`${MenuProvider.preRoute}/admin/open-service`);
                                }}>去开通</Button>
                            </div>,
                            duration: 10,
                        })
                    }}
                >
                    <BankOutlined className='text-6xl' />
                    <div className='mt-2'>仓库管理</div>
                </div>
            </div>
        </div>
        <div className='bg-white rounded-md p-4 mt-4'>
            <div className='text-xl font-semibold'>QA</div>
            <Divider />
            <div>
                <div className='font-semibold'>如何续费AI客服？</div>
                <div>1、切换到 <Button target='_blank' type='link' href={`${MenuProvider.preRoute}/admin/recharge`}>余额充值</Button> 页面对当前账号进行充值。</div>
                <div>2、切换到 <Button type='link' href={`${MenuProvider.preRoute}/admin/open-service`}>开通服务</Button> 页面，选择 AI问答/客服 进行续期。</div>
            </div>
            <Divider />
            <div>
                <div className='font-semibold'>如何续费进销存？</div>
                <div>1、切换到 <Button target='_blank' type='link' href={`${MenuProvider.preRoute}/admin/recharge`}>余额充值</Button> 页面对当前账号进行充值。</div>
                <div>2、切换到 <Button type='link' href={`${MenuProvider.preRoute}/admin/open-service`}>开通服务</Button> 页面，选择 进销存 进行续期。</div>
            </div>
            <Divider />
            <div>
                <div className='font-semibold'>如何续费仓库管理？</div>
                <div>1、切换到 <Button target='_blank' type='link' href={`${MenuProvider.preRoute}/admin/recharge`}>余额充值</Button> 页面对当前账号进行充值。</div>
                <div>2、切换到 <Button type='link' href={`${MenuProvider.preRoute}/admin/open-service`}>开通服务</Button> 页面，选择 仓库管理 进行续期。</div>
            </div>
        </div>
    </div>
}