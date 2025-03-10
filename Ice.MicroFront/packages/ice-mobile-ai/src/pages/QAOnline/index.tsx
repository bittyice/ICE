import React, { useState } from 'react';
import { UserOutlined, SendOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { svgs, qaOnlineSlice, IceStateType, GptEntity } from 'ice-core';
import { Input, Button, Empty, Space, Badge, Popover, Toast, Modal, Dialog } from 'antd-mobile';
import * as signalR from "@microsoft/signalr";
import { token, Tool } from 'ice-common';
import MessageBox from '../../components/MessageBox';
import { useDispatch, useSelector } from 'react-redux';
import { LeftOutline } from 'antd-mobile-icons'

type MessageInfoType = IceStateType['qaOnline']['messageGroup'][number]

const GuestItem = (props: {
    className?: string,
    name: string,
    lastMessage: string | null | undefined,
    hasNew: boolean,
    onClick: () => void,
    onClose: () => void,
}) => {
    return <div className={`flex items-center cursor-pointer pt-3 pb-3 pl-4 pr-4 ${props.className} relative`} onClick={props.onClick}>
        <div className='bg-slate-500 rounded-md p-2 mr-4'>
            <UserOutlined className='text-white text-3xl' />
        </div>
        <div>
            <div className='font-semibold text-lg'>{props.name}</div>
            <div className='text-slate-500'>{props.lastMessage?.substring(0, 8)}</div>
        </div>
        <div className='grow shrink'></div>
        <div>
            <Button size='small' fill='none' onClick={(e) => {
                Dialog.confirm({
                    content: '关闭该消息框？',
                    confirmText: '确定',
                    cancelText: '取消',
                    onConfirm: props.onClose
                });
                e.stopPropagation();
                return false;
            }}><CloseCircleOutlined /></Button>
        </div>
        {
            props.hasNew && <span className='absolute left-2 top-2 bg-red-600 rounded-lg text-white pl-2 pr-2'>new</span>
        }
    </div>
}

class QaOnline extends React.Component<{
    dispatch: (action: any) => void,
    messageGroup: Array<MessageInfoType>,
    gpt: GptEntity
}> {
    connection: signalR.HubConnection | null = null;

    state = {
        curConnectId: null,
    }

    componentDidMount(): void {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("/signalr-hubs/qa", {
                accessTokenFactory: () => token.token || ''
            })
            .withAutomaticReconnect()
            .build();

        connection.on("receiveMessageOfAdmin", (
            connectionId: string,
            role: string,
            text?: string,
            original?: string,
            additionalMetadata?: string
        ) => {
            let additionalMetadataObj: any;
            if (additionalMetadata) {
                try {
                    additionalMetadataObj = JSON.parse(additionalMetadata);
                } catch { }
            }
            this.props.dispatch(qaOnlineSlice.actions.addMessage({
                connectionId: connectionId,
                role: role as any,
                content: text,
                original: original,
                href: additionalMetadataObj?.href,
                setNewSign: connectionId != this.state.curConnectId,
                time: Tool.dateFormat(new Date(), 'yy-MM-dd hh:mm')!,
            }));
        });

        connection.onclose(async () => {
            console.log('signalr已关闭');
        });

        connection.start().catch((err) => {
            console.log(err);
        });

        this.connection = connection;
    }

    componentWillUnmount(): void {
        this.connection?.stop();
        console.log('关闭signalr');
    }

    fetchQA = async (connectId: string, messageStr: string) => {
        try {
            await this.connection?.send('SendMessageToGuest', connectId, messageStr);
            this.props.dispatch(qaOnlineSlice.actions.addMessage({
                connectionId: connectId,
                role: 'customer-service',
                content: messageStr,
                setNewSign: false,
                time: Tool.dateFormat(new Date(), 'yy-MM-dd hh:mm')!,
            }));
        }
        catch (e) {
        }
    }

    clearMessages = (connectId: string) => {
        this.props.dispatch(qaOnlineSlice.actions.clear({ connectionId: connectId }));
    }

    fetchEnableAI = async (connectionId: string, enable: boolean) => {
        await this.connection?.send('EnableAI', connectionId, enable);
    }

    render(): React.ReactNode {
        let messageGroup = [...this.props.messageGroup];
        let curMessageInfo = messageGroup.find(e => e.connectionId == this.state.curConnectId);
        return <div className='flex h-full w-full'>
            <div className='flex flex-col gap-1 h-full w-full overflow-y-auto' style={{
                display: curMessageInfo ? 'none' : 'flex'
            }}>
                {
                    messageGroup.map((messageInfo, index) => <GuestItem
                        className={this.state.curConnectId == messageInfo.connectionId ? 'bg-gray-100' : 'bg-white'}
                        key={messageInfo.connectionId}
                        name={`访客-${messageInfo.connectionId.substring(0, 4)}`}
                        hasNew={messageInfo.hasNew}
                        onClick={() => {
                            this.setState({ curConnectId: messageInfo.connectionId });
                            this.props.dispatch(qaOnlineSlice.actions.cancelNew({ connectionId: messageInfo.connectionId }));
                        }}
                        lastMessage={messageInfo.messages[messageInfo.messages.length - 1]?.content as string}
                        onClose={() => {
                            this.props.dispatch(qaOnlineSlice.actions.remove({ connectionId: messageInfo.connectionId }));
                        }}
                    />)
                }
                {
                    messageGroup.length == 0 && <Empty className='mt-8 h-full' description='暂无访客' />
                }
            </div>
            <div className='bg-gray-100 flex flex-col h-full w-full overflow-y-hidden'
                style={{
                    display: !curMessageInfo ? 'none' : 'flex'
                }}
            >

                {
                    curMessageInfo &&
                    <>
                        <div className='grow-0 shrink-0 p-4 bg-white text-xl font-semibold flex items-center shadow-sm'
                            onClick={() => {
                                this.setState({ curConnectId: null });
                            }}
                        >
                            <LeftOutline />
                            <span className='ml-4'>{`访客-${curMessageInfo.connectionId.substring(0, 4)}`}</span>
                        </div>
                        <div className='grow shrink overflow-y-hidden pt-2 pb-2'>
                            <MessageBox
                                currentRole='customer-service'
                                showOriginal={true}
                                messages={curMessageInfo.messages}
                                fetchSendMessage={(message) => this.fetchQA(curMessageInfo!.connectionId, message)}
                                clearMessages={() => this.clearMessages(curMessageInfo!.connectionId)}
                                tools={<Space>
                                    <Button fill='none' onClick={async () => {
                                        await this.fetchEnableAI(curMessageInfo!.connectionId, false);
                                        Toast.show("已关闭");
                                    }}>关闭AI</Button>
                                    <Button fill='none' color='primary' onClick={async () => {
                                        Toast.show("已开启");
                                        await this.fetchEnableAI(curMessageInfo!.connectionId, true);
                                    }}>开启AI</Button>
                                </Space>}
                            />
                        </div>
                    </>
                }
            </div>
        </div>
    }
}

export default () => {
    const dispatch = useDispatch();
    var messageGroup = useSelector((state: IceStateType) => state.qaOnline.messageGroup);
    const gpt = useSelector((state: IceStateType) => state.global.gpt);

    return <QaOnline
        dispatch={dispatch}
        messageGroup={messageGroup}
        gpt={gpt}
    />
};