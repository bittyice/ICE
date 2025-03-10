import React from 'react';
import { Avatar, List, Button, Skeleton, Dialog, Switch, ActionSheet } from 'antd-mobile';
import {
    AddressBookFill,
    GlobalOutline,
    ChatCheckOutline,
    MessageFill,
} from 'antd-mobile-icons';
import { DynamicBackground, MenuProvider } from 'ice-mobile-layout';
import { token } from 'ice-common';
import { useNavigate } from 'react-router';
import { configuration, globalSlice, IceStateType, TenantEntity, UserEntity } from 'ice-core';
import { useSelector } from 'react-redux';
import { WechatOutlined, PhoneOutlined, MoneyCollectOutlined } from '@ant-design/icons';

import './index.css';

class Mine extends React.Component<{
    navigate: (url: string) => void,
    tenant: TenantEntity,
    user: UserEntity,
}> {
    state = {
        // 显示语言选择
        showLanguage: false,
    }

    render(): React.ReactNode {
        return <div>
            <DynamicBackground className='mine-header'>
                <div className='mine-header-top'>
                    我的
                </div>
                <div className='mine-header-info'>
                    <Avatar style={{ '--size': '64px', '--border-radius': '32px' }} className='mine-header-info-avatar' src='' />
                    <div className='mine-header-info-right'>
                        <div className='text-xl'>
                            <PhoneOutlined />
                            <span className='ml-2'>{this.props.user.phoneNumber}</span>
                        </div>
                        <div className='text-xl mt-2'>
                            <MoneyCollectOutlined />
                            <span className='ml-2'>{this.props.tenant.amount} ￥</span>
                        </div>
                        <div>
                            <Skeleton.Paragraph style={{ width: '80%' }} lineCount={1} />
                        </div>
                    </div>
                </div>
            </DynamicBackground>
            <div className='mine-body'>
                <List>
                    <List.Item prefix={<GlobalOutline />} onClick={() => {
                        this.setState({ showLanguage: true });
                    }}>
                        中文
                    </List.Item>
                    <List.Item prefix={<WechatOutlined />}
                        disabled={!!this.props.user.wxOpenId}
                        onClick={() => {
                            this.props.navigate(MenuProvider.getUrl(['wxbind']));
                        }}>
                        <span>绑定微信 {this.props.user.wxOpenId ? '(已绑定)' : ''}</span>
                    </List.Item>
                </List>
                <Button size='large' shape='rectangular' style={{ marginTop: 15 }} block color='danger'
                    onClick={() => {
                        Dialog.confirm({
                            content: '退出登录',
                            confirmText: '确定',
                            cancelText: '取消',
                            onConfirm: () => {
                                token.clearToken();
                                this.props.navigate(`${configuration.mobileRouterPre}/`);
                            }
                        });
                    }}
                >退出登录</Button>
            </div>
        </div>
    }
}

export default () => {
    const nav = useNavigate();
    const tenant = useSelector((state: IceStateType) => state.global.tenant);
    const user = useSelector((state: IceStateType) => state.global.user);
    return <Mine
        navigate={nav}
        tenant={tenant}
        user={user}
    />
};