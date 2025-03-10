import React, { useEffect, useState } from 'react';
import { Button, Divider, message, Input, notification, Badge, FloatButton } from 'antd';
import { MessageOutlined, PlusOutlined, SearchOutlined, HomeOutlined, DownCircleOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import MenuProvider from '../../menu/MenuProvider';
import { useNavigate } from 'react-router';
import { AnnouncementApi } from 'ice-core';

const ServerMessage = () => {
    const [announcement, setAnnouncement] = useState<any>(null);

    useEffect(() => {
        AnnouncementApi.getAnnouncement().then(data => {
            setAnnouncement(data);
        });
    }, []);

    return <Badge count={!!announcement ? '1' : undefined}>
        <Button className='text-gray-50' type='ghost' icon={<MessageOutlined />}
            onClick={() => {
                if (!announcement) {
                    message.success("暂无消息");
                    return;
                }
                notification.info({
                    message: announcement.title,
                    description: announcement.content
                });
            }}
        ></Button>
    </Badge>
}

export default () => {
    const [hide, setHide] = useState(false);
    const nav = useNavigate();

    let curMenuGroupInfo = MenuProvider.getCurMenuGroupInfo();

    return <div className='flex w-full pl-2 pr-2 layou-h' style={{ marginTop: hide ? -32 : 4 }}>
        <div className='flex grow shrink pl-8 pr-8 gap-4 items-center h-14 rounded-full' style={{ backgroundColor: '#120338' }}>
            <Button className='text-gray-50' type='ghost' icon={<PlusOutlined />}></Button>
            <div className='border-0 border-l border-gray-300 border-solid h-2/4' />
            <Button className='text-gray-50' type='ghost' icon={<HomeOutlined />}
                onClick={() => {
                    nav(MenuProvider.getHomeUrl());
                }}
            ></Button>
            <div className='grow' />
            {
                curMenuGroupInfo?.part
            }
            {
                MenuProvider.globalParts
            }
            <ServerMessage />
        </div>
        <div className='ml-3 h-14 w-14 flex grow-0 shrink-0 items-center justify-center rounded-full' style={{ backgroundColor: '#120338' }}>
            <Button
                size='large'
                className='text-white'
                type='ghost' onClick={() => {
                    setHide(!hide)
                }}><FullscreenOutlined /></Button>
        </div>
    </div>
}