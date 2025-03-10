import React, { useEffect, useState } from 'react';
import { Avatar, Typography, Space, Divider, message, Modal, Input, Button, Popover } from 'antd';
import { UserOutlined, LockOutlined, LogoutOutlined, FileTextOutlined, HomeOutlined, MoneyCollectOutlined, PhoneOutlined, WechatOutlined } from '@ant-design/icons';
import { token, createClearReduxDatasAction } from 'ice-common';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IceStateType, configuration } from 'ice-core';
import MenuProvider from '../../menu/MenuProvider';
//@ts-ignore
import gzhImg from '../../statics/gzh.jpg';

const UserInfo = () => {
    const tenant = useSelector((state: IceStateType) => state.global.tenant);
    const user = useSelector((state: IceStateType) => state.global.user);

    return <div>
        <div>
            <PhoneOutlined />
            <span className='ml-4'>{user.phoneNumber}</span>
        </div>
        <div className='mt-2'>
            <MoneyCollectOutlined /><span className='ml-4'>{tenant.amount} ￥</span>
        </div>
    </div>
}

const RightSider = () => {
    const nav = useNavigate();
    const dispatch = useDispatch();

    let backs = [] as typeof MenuProvider.menuGroupInfos;
    for (let menuGroupInfo of MenuProvider.menuGroupInfos) {
        if (!menuGroupInfo.allow || menuGroupInfo.allow() == true) {
            backs.push(menuGroupInfo);
        }
    }

    return <div className='h-full w-24 flex flex-col items-center' style={{ backgroundColor: '#120338' }}>
        <div className='w-full p-2' />
        <Popover content={<UserInfo />} placement='left'>
            <Button size='large' className='mb-2' type='primary'>
                <UserOutlined />
            </Button>
        </Popover>
        <span className='text-sm text-white'>哈喽</span>
        <div style={{ width: '40%', borderBottom: '2px solid #999797', marginTop: 14, marginBottom: 14 }}></div>
        <Space direction='vertical'>
            {
                backs.map(item => {
                    let isactive = item.backstage == MenuProvider.backstage;
                    return <Button size='large' type={isactive ? 'primary' : 'default'} title={item.text}
                        onClick={() => {
                            nav(MenuProvider.getHomeUrl(item.backstage));
                        }}
                    >
                        {item.icon}
                    </Button>
                })
            }
        </Space>
        <div style={{ flexGrow: 1 }} />
        <Space direction='vertical'>
            <Popover
                placement='left'
                content={<div>
                    <div className='text-lg font-semibold'>关注公众号，进入手机端</div>
                    <img className='w-48 h-48' src={gzhImg} />
                </div>}
            >
                <Button size='large'>
                    <WechatOutlined />
                </Button>
            </Popover>
            <Button size='large' title='文档' onClick={() => {
                window.open("https://www.bittyice.cn/docs/ai");
            }}><FileTextOutlined /></Button>
            <Button size='large' type='primary' title='注销' danger
                onClick={() => {
                    token.clearToken();
                    dispatch(createClearReduxDatasAction());
                    nav(`${configuration.pcRouterPre}/login/admin`);
                }}
            ><LogoutOutlined /></Button>
        </Space>
        <div className='w-full p-2' />
    </div>
}

export default RightSider;