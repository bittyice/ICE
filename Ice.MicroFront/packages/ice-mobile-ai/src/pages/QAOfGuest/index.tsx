import React, { useEffect, useRef, useState } from 'react';
import { IceStateType, GptEntity, GptApi, MessageItemType, consts } from 'ice-core';
import { iceFetch, Tool } from 'ice-common';
import * as signalR from "@microsoft/signalr";
import MessageBox from '../../components/MessageBox';
import { Dialog, SafeArea, Input, Button } from 'antd-mobile';
import { Navigate } from 'react-router';

type ContactType = { guestName?: string, phone?: string, email?: string };

const Contact = (props: {
    onOk: (params: ContactType) => Promise<any>
}) => {
    const [loading, setLoading] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [vailfail, setVailfail] = useState(false);

    const submit = () => {
        if (!phone) {
            setVailfail(true);
            return;
        }

        setVailfail(false);
        setLoading(true);
        props.onOk({
            guestName,
            phone,
            email
        }).finally(() => {
            setLoading(false);
        });
    }

    return <div className='p-4'>
        <div className='text-xl font-semibold'>嘿，我们希望获取你的联系方式！</div>
        <div className='flex flex-col gap-4 mt-4'>
            <Input
                className='pl-2 pr-2 pt-1 pb-1'
                placeholder='你的称呼'
                maxLength={consts.MinTextLength}
                value={guestName}
                onChange={e => setGuestName(e)}
            />
            <Input
                className={`pl-2 pr-2 pt-1 pb-1 ${(vailfail && !phone) ? 'border border-solid border-red-600 rounded' : ''}`}
                placeholder='联系方式'
                maxLength={consts.MinTextLength}
                value={phone}
                onChange={e => setPhone(e)}
            />
            <Input
                className='pl-2 pr-2 pt-1 pb-1'
                placeholder='邮箱地址'
                maxLength={consts.MinTextLength}
                value={email}
                onChange={e => setEmail(e)}
            />
            <Button shape='rounded' loading={loading} block color='primary' onClick={submit}>提交</Button>
        </div>
    </div>
}

export default class extends React.Component {
    connection: signalR.HubConnection | null = null;

    state = {
        messages: [
            // {
            //     role: 'assistant',
            //     content: '手机号',
            //     original: 'ASFDWEFGSDSFG你好呀！！！！！！！！！！！'
            // }
        ] as Array<MessageItemType>,
        sendedContact: false,
    }

    isWx() {
        var ua = navigator.userAgent.toLowerCase();
        var isWeixin = ua.indexOf('micromessenger') != -1;
        if (isWeixin) {
            return true;
        } else {
            return false;
        }
    }

    componentDidMount(): void {
        this.init();
    }

    componentWillUnmount(): void {
        this.connection?.stop();
        console.log('关闭signalr');
    }

    init = async () => {
        const qakey = Tool.getUrlVariable(window.location.search, 'guestkey');
        if (!qakey) {
            Dialog.confirm({
                title: '无效的访客key'
            })
            return;
        }

        // 请求token
        let token = await fetch('/api/auth/account/guest-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                guestKey: qakey
            })
        }).then(res => res.text());

        // 请求gpt信息
        let gpt = await iceFetch<GptEntity>('/api/ai/gpt', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // 设置欢迎语句
        this.setQaWelcomeText(gpt);
        // 初始化Signalr
        this.initSignalr(token);
        // 设置联系框
        this.setContactBox(gpt);
        // 友情提示
        this.setTip();
        // 设置未提问时自动发送的文本
        this.setClientNoResponseText(gpt);
        // 设置引导问题
        this.setClientGuideQuestionText(gpt);
    }

    initSignalr(token: string) {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("/signalr-hubs/qa", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connection.on("receiveMessageOfGuest", (
            role: string,
            text?: string,
            original?: string,
            additionalMetadata?: string,
        ) => {
            let additionalMetadataObj: any;
            if (additionalMetadata) {
                try {
                    additionalMetadataObj = JSON.parse(additionalMetadata);
                } catch { }
            }
            let messageItem: MessageItemType = {
                role: role as any,
                content: text,
                original: original,
                href: additionalMetadataObj?.href,
                time: Tool.dateFormat(new Date(), 'yy-MM-dd hh:mm')!,
            };
            let newMessages = [...this.state.messages, messageItem];
            this.setState({ messages: newMessages });
        });

        connection.onclose(async () => {
            console.log('signalr已关闭');
        });

        connection.start().catch((err) => {
            console.log(err);
        });

        this.connection = connection;
    }

    setQaWelcomeText(gpt: GptEntity) {
        let messageItem: MessageItemType = {
            role: 'assistant',
            content: gpt.qaWelcomeText,
            time: Tool.dateFormat(new Date(), 'yy-MM-dd hh:mm')!,
        };

        let newMessages = [...this.state.messages, messageItem];
        this.state.messages = newMessages;
        this.setState({});
    }

    setContactBox = (gpt: GptEntity) => {
        if (gpt.contactBoxSpanTime === undefined || gpt.contactBoxSpanTime === null) {
            return;
        }

        if (gpt.contactBoxSpanTime! < 0) {
            return;
        }

        if (gpt.contactBoxSpanTime === 0) {
            let newMessages = [...this.state.messages];
            newMessages.push({
                role: 'system',
                content: <Contact onOk={this.fetchSendContact} />,
                time: Tool.dateFormat(new Date(), 'yy-MM-dd hh:mm')!,
            });

            this.state.messages = newMessages;
            this.setState({});
            return;
        }

        var h = setInterval(() => {
            if (this.state.sendedContact) {
                clearInterval(h);
                return;
            }

            let lastMessage = this.state.messages[this.state.messages.length - 1];
            if (lastMessage && lastMessage.role === 'system') {
                return;
            }

            let newMessages = [...this.state.messages];
            newMessages.push({
                role: 'system',
                content: <Contact onOk={this.fetchSendContact} />,
                time: Tool.dateFormat(new Date(), 'yy-MM-dd hh:mm')!,
            });

            this.state.messages = newMessages;
            this.setState({});
        }, gpt.contactBoxSpanTime * 1000)
    }

    setTip() {
        setTimeout(() => {
            let systemItem: MessageItemType = {
                role: 'system',
                content: '如果AI不清楚答案，你可以更换一下提问方式哦，例如 加上你要咨询的产品名称！',
                time: Tool.dateFormat(new Date(), 'yy-MM-dd hh:mm')!,
            };
            this.setState({
                messages: [...this.state.messages, systemItem]
            });
        }, 30000);
    }

    setClientNoResponseText(gpt: GptEntity) {
        if (gpt.clientNoResponseTime !== null && gpt.clientNoResponseTime !== undefined && gpt.clientNoResponseText) {
            setTimeout(() => {
                if (this.state.messages.some(e => e.role === 'user')) {
                    return;
                }
                let newMessages = [...this.state.messages];
                newMessages.push({
                    role: 'system',
                    content: gpt.clientNoResponseText,
                    time: Tool.dateFormat(new Date(), 'yy-MM-dd hh:mm')!,
                });

                this.state.messages = newMessages;
                this.setState({});
            }, gpt.clientNoResponseTime * 1000);
        }
    }

    setClientGuideQuestionText(gpt: GptEntity) {
        if (!gpt.clientGuideQuestionText || !gpt.clientGuideQuestionText.trim()) {
            return;
        }

        let questions = gpt.clientGuideQuestionText.split(' ');
        if (questions.length === 0) {
            return;
        }

        let newMessages = [...this.state.messages];
        newMessages.push({
            role: 'system',
            content: <div className='flex flex-col gap-2 p-3'>
                <div className='text-lg font-semibold'>快速提问</div>
                {
                    questions.map(item => <div className='text-blue-500 cursor-pointer' onClick={() => {
                        this.fetchQA(item);
                    }}>- {item}</div>)
                }
            </div>,
            time: Tool.dateFormat(new Date(), 'yy-MM-dd hh:mm')!,
        });

        this.state.messages = newMessages;
        this.setState({});
    }

    fetchSendContact = async (contact: ContactType) => {
        await this.connection?.send('sendContact', contact);
        let newMessages = [...this.state.messages];
        newMessages.push({
            role: 'system',
            content: '感谢你提供的联系方式，我们的客服会在第一时间致电你！',
            time: Tool.dateFormat(new Date(), 'yy-MM-dd hh:mm')!,
        });
        this.setState({ sendedContact: true, messages: newMessages });
    }

    fetchQA = async (message: string) => {
        try {
            this.connection?.send('sendMessagePlus', message, this.state.messages.filter(e => e.role !== 'system'));

            let messageItem: MessageItemType = {
                role: 'user',
                content: message,
                time: Tool.dateFormat(new Date(), 'yy-MM-dd hh:mm')!,
            };
            let newMessages = [...this.state.messages, messageItem];
            this.setState({
                messages: newMessages,
            });
        }
        catch (e) {

        }
    }

    clearMessages = () => {
        this.setState({
            messages: []
        });
    }

    render(): React.ReactNode {
        let iswx = this.isWx();
        return <div className={`w-full h-full pt-2 bg-gray-50 ${iswx ? 'pb-8' : ''}`} style={{ fontSize: 14, lineHeight: '22px' }}>
            <MessageBox
                currentRole='user'
                messages={this.state.messages}
                fetchSendMessage={this.fetchQA}
                clearMessages={this.clearMessages}
            />
            <div style={{ background: '#ffcfac' }}>
                <SafeArea position='bottom' />
            </div>
        </div>
    }
}