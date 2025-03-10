import React, { useState } from 'react';
import { SendOutlined, ReloadOutlined, UserOutlined, MessageOutlined, DesktopOutlined } from '@ant-design/icons';
import { MessageItemType, MessageRoleType, consts, svgs } from 'ice-core';
import { Input, message, Button, Empty } from 'antd';

const MessageItem = (props: MessageItemType & {
    currentRole: MessageItemType['role'],
    showOriginal?: boolean,
}) => {
    let rightShow = (props.role == props.currentRole);

    let icon;
    if (props.role == 'system') {
        icon = (<div className="flex items-center text-gray-900 text-4xl" style={{ height: 29 }}>
            <DesktopOutlined className='text-gray-900 text-3xl' />
        </div>);
    }
    else if (props.role == 'assistant') {
        icon = (<div className="flex items-center text-green-600 text-4xl" style={{ height: 29 }}>
            <svgs.OpenAI width='1.875rem' height='1.875rem' />
        </div>);
    }
    else if (props.role == 'customer-service') {
        icon = (<div className="flex items-center text-purple-600 text-4xl" style={{ height: 29 }}>
            <svgs.QA width='1.875rem' height='1.875rem' />
        </div>);
    }
    else {
        icon = (<div className='flex items-center' style={{ height: 29 }}>
            <UserOutlined className='text-blue-600 text-3xl' />
        </div>);
    }

    const messageContent = (<div className={`flex flex-col flex-shrink flex-grow ${rightShow ? 'items-end' : 'items-start'}`}>
        {
            props.time &&
            <div className='text-base text-slate-400 mb-2'>{props.time}</div>
        }
        <div className='border rounded-md border-slate-200 border-solid pt-1 pb-1 pl-2 pr-2 bg-white whitespace-pre-line'>
            {props.content}
        </div>
        {
            props.showOriginal === true && props.original &&
            <div className='border rounded-md border-slate-300 border-solid p-4 text-slate-400 mt-2 whitespace-pre-line'>
                {`参考原文：\n ${props.original}`}
            </div>
        }
        {
            props.href &&
            <a className='mt-2 no-underline' target='_blank' href={props.href}>附加连接</a>
        }
    </div>)

    if (rightShow) {
        return <div className='flex gap-4 items-start justify-end'>
            <div className='w-8 shrink-0' />
            {messageContent}
            <div className='shrink-0 grow-0'>{icon}</div>
        </div>
    }
    else {
        return <div className='flex gap-4 items-start'>
            <div className='shrink-0 grow-0'>{icon}</div>
            {messageContent}
            <div className='w-8 shrink-0' />
        </div>
    }
}

type Props = {
    currentRole: MessageItemType['role'],
    messages: Array<MessageItemType>,
    fetchSendMessage: (message: string) => Promise<void>,
    clearMessages: () => void,
    tools?: React.ReactNode,
    showOriginal?: boolean
}

class MessageBox extends React.Component<Props> {
    messageListRef: HTMLDivElement | null = null;

    state = {
        message: '',
        isAutoScroll: true
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): boolean {
        if (nextProps.messages != this.props.messages && this.state.isAutoScroll) {
            // 等待页面渲染完成后再进行滚动
            setTimeout(() => {
                this.messageListRef?.scrollTo(0, this.messageListRef.scrollHeight);
            }, 1);
        }
        return true;
    }

    scrollH: NodeJS.Timeout | undefined;
    messageListScrollEvent = () => {
        if (this.scrollH) {
            clearTimeout(this.scrollH);
        }
        this.scrollH = setTimeout(() => {
            this.scrollH = undefined;
            let ele = this.messageListRef;
            if (!ele) {
                return;
            }

            // 如果滚动条滚动到了底部
            if (ele.scrollTop + ele.clientHeight + 20 > ele.scrollHeight) {
                this.setState({
                    isAutoScroll: true
                });
            }
            else {
                this.setState({
                    isAutoScroll: false
                });
            }
        }, 500);
    }

    render(): React.ReactNode {
        return <div className='flex flex-col gap-4 pl-6 pr-3 pt-8 pb-8 rounded-md h-full overflow-y-hidden'>
            <div ref={r => this.messageListRef = r} className='flex flex-col gap-4 pr-3 grow shrink overflow-y-auto ice-scrollbar-bgwhite'
                onScroll={this.messageListScrollEvent}
            >
                {
                    this.props.messages.map((item, index) => <MessageItem
                        key={index}
                        currentRole={this.props.currentRole}
                        {...item}
                        content={item.content || '--'}
                        showOriginal={this.props.showOriginal}
                    />)
                }
            </div>
            <div className='grow-0 shrink-0 pr-3'>
                <div className='flex justify-end mb-1'>
                    {this.props.tools}
                    <Button type='text' icon={<ReloadOutlined />} onClick={this.props.clearMessages}></Button>
                    <Button disabled={!this.state.message} type='text' icon={<SendOutlined />} onClick={() => {
                        if (!this.state.message) {
                            return;
                        }
                        this.props.fetchSendMessage(this.state.message).then(() => {
                            this.setState({ message: '' });
                            // 将滚动条滚动最下面
                            setTimeout(() => {
                                this.messageListRef?.scrollTo(0, this.messageListRef.scrollHeight);
                            }, 1);
                        });
                    }}></Button>
                </div>
                <Input
                    className='shrink grow rounded-full'
                    size='large'
                    prefix={<MessageOutlined className='mr-2' />}
                    placeholder='有问题尽管问我...'
                    showCount
                    maxLength={consts.LargerTextLength}
                    value={this.state.message}
                    onChange={(e) => {
                        this.setState({ message: e.target.value });
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            if (!this.state.message) {
                                return;
                            }
                            this.props.fetchSendMessage(this.state.message).then(() => {
                                this.setState({ message: '' });
                                // 将滚动条滚动最下面
                                setTimeout(() => {
                                    this.messageListRef?.scrollTo(0, this.messageListRef.scrollHeight);
                                }, 1);
                            });
                        }
                    }}
                />
            </div>
        </div>
    }
}

export default MessageBox;