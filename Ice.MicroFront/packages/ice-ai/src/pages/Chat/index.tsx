import React, { useState } from 'react';
import { UserOutlined, SendOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { svgs, chatSlice, IceStateType } from 'ice-core';
import { iceFetch } from 'ice-common';
import { useDispatch, useSelector } from 'react-redux';
import MessageBox from '../../components/MessageBox';

type MessageItemType = IceStateType['chat']['messages'][number];

export default () => {
    const dispatch = useDispatch();
    const messages = useSelector((state: IceStateType) => state.chat.messages);

    const fetchChat = async (message: string) => {
        try {
            let messageItem: MessageItemType = {
                role: 'user',
                content: message
            }
            let newmessages = [...messages, messageItem];
            dispatch(chatSlice.actions.addMessage({
                messageItem: messageItem
            }));

            var reply = await iceFetch<string>('/api/ai/chat/chat', {
                method: 'POST',
                body: JSON.stringify({
                    messages: newmessages
                })
            });

            dispatch(chatSlice.actions.addMessage({
                messageItem: {
                    role: 'assistant',
                    content: reply
                }
            }));
        }
        catch (e) {
        }
    }

    const clearMessages = () => {
        dispatch(chatSlice.actions.clear({}));
    }

    return <MessageBox
        currentRole='user'
        messages={messages}
        fetchSendMessage={fetchChat}
        clearMessages={clearMessages}
    />
}