import React, { useState } from 'react';
import { UserOutlined, SendOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { svgs, qaSlice, IceStateType, MessageItemType, QaApi } from 'ice-core';
import { iceFetch, Tool } from 'ice-common';
import { useDispatch, useSelector } from 'react-redux';
import MessageBox from '../../components/MessageBox';

export default () => {
    const dispatch = useDispatch();
    const messages = useSelector((state: IceStateType) => state.qa.messages);

    const fetchQA = async (message: string) => {
        try {
            let messageItem: MessageItemType = {
                role: 'user',
                content: message,
                time: Tool.dateFormat(new Date(), 'yy-MM-dd hh:mm')!,
            }
            dispatch(qaSlice.actions.addMessage({
                messageItem: messageItem
            }));

            var res = await QaApi.qa({ question: message });

            dispatch(qaSlice.actions.addMessage({
                messageItem: {
                    role: 'assistant',
                    content: res.answer,
                    href: res.additionalMetadataObj?.href,
                    time: Tool.dateFormat(new Date(), 'yy-MM-dd hh:mm')!,
                }
            }));
        }
        catch (e) {

        }
    }

    const clearMessages = () => {
        dispatch(qaSlice.actions.clear({}));
    }

    return <MessageBox
        currentRole='user'
        messages={messages}
        fetchSendMessage={fetchQA}
        clearMessages={clearMessages}
    />
}