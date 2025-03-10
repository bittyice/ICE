import React, { useEffect, useState } from 'react';
import { UserOutlined, SendOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { svgs, qaOnlineSlice, IceStateType, GptEntity, csTextSlice, CsTextEntity } from 'ice-core';
import { Input, message, Button, Empty, Space, Badge, Popover, Popconfirm, Collapse, List } from 'antd';
import * as signalR from "@microsoft/signalr";
import { token, Tool } from 'ice-common';
import MessageBox from '../../components/MessageBox';
import { useDispatch, useSelector } from 'react-redux';

type MessageInfoType = IceStateType['qaOnline']['messageGroup'][number]

const GuestItem = (props: {
    className?: string,
    name: string,
    lastMessage: string | null | undefined,
    hasNew: boolean,
    onClick: () => void,
    onClose: () => void,
}) => {
    return <div className={`flex items-center cursor-pointer pt-2 pb-2 pl-4 pr-4 ${props.className} relative`} onClick={props.onClick}>
        <div className='bg-slate-500 rounded-md p-2 mr-4'>
            <UserOutlined className='text-white text-3xl' />
        </div>
        <div>
            <div className='font-semibold text-lg'>{props.name}</div>
            <div className='text-slate-500'>{props.lastMessage?.substring(0, 8)}</div>
        </div>
        <div className='grow shrink'></div>
        <div>
            <Popconfirm
                title="移除消息"
                description="你确定要移除该消息项吗？"
                onConfirm={(e) => {
                    e?.stopPropagation();
                    props.onClose();
                }}
                okText="确定"
                cancelText="取消"
            >
                <Button size='small' type='text' icon={<CloseCircleOutlined />} onClick={(e) => {
                    e.stopPropagation();
                }}></Button>
            </Popconfirm>
        </div>
        {
            props.hasNew && <span className='absolute left-2 top-2 bg-red-600 rounded-lg text-white pl-2 pr-2'>new</span>
        }
    </div>
}

class QaOnline extends React.Component<{
    dispatch: (action: any) => void,
    messageGroup: Array<MessageInfoType>,
    gpt: GptEntity,
    csTexts: Array<CsTextEntity>
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
        return <div className='flex h-full w-full bg-white'>
            <div className='flex flex-col gap-1 w-2/12 h-full overflow-y-auto grow-0 shrink-0'>
                {
                    messageGroup.map((messageInfo, index) => <GuestItem
                        className={this.state.curConnectId == messageInfo.connectionId ? 'bg-slate-200' : 'bg-white'}
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
                    messageGroup.length == 0 && <Empty className='mt-8' description='暂无访客' />
                }
            </div>
            <div className='grow shrink bg-slate-200 h-full overflow-y-hidden'>
                {
                    curMessageInfo &&
                    <MessageBox
                        currentRole='customer-service'
                        showOriginal={true}
                        messages={curMessageInfo.messages}
                        fetchSendMessage={(message) => this.fetchQA(curMessageInfo!.connectionId, message)}
                        clearMessages={() => this.clearMessages(curMessageInfo!.connectionId)}
                        tools={<Space>
                            <Button size='small' onClick={async () => {
                                await this.fetchEnableAI(curMessageInfo!.connectionId, false);
                                message.success('已 关闭 该访客的AI自动回复');
                            }}>关闭AI自动回复</Button>
                            <Button type='primary' size='small' onClick={async () => {
                                message.success('已 开启 该访客的AI自动回复');
                                await this.fetchEnableAI(curMessageInfo!.connectionId, true);
                            }}>开启AI自动回复</Button>
                        </Space>}
                    />
                }
            </div>
            <div className='w-2/12'>
                <Collapse bordered={false} accordion items={this.props.csTexts.map((item, index) => {
                    let list = item.textList?.split('\n') || [];
                    return {
                        key: index,
                        label: item.groupName,
                        children: <div className='flex flex-col gap-2'>
                            {
                                list.map((text, i) => <div className='cursor-pointer' key={i} onClick={() => {
                                    if(!curMessageInfo) {
                                        return;
                                    }

                                    this.fetchQA(curMessageInfo!.connectionId, text)
                                }}>{text}</div>)
                            }
                        </div>,
                    }
                })} />
            </div>
        </div>
    }
}

export default () => {
    const dispatch = useDispatch();
    const messageGroup = useSelector((state: IceStateType) => state.qaOnline.messageGroup);
    const gpt = useSelector((state: IceStateType) => state.global.gpt);
    const csTexts = useSelector((state: IceStateType) => state.csText.allDatas) || [];

    useEffect(() => {
        dispatch(csTextSlice.asyncActions.fetchAllDatas({}) as any);
    }, []);

    return <QaOnline
        dispatch={dispatch}
        messageGroup={messageGroup}
        gpt={gpt}
        csTexts={csTexts}
    />
};