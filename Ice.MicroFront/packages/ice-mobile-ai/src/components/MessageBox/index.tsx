import React, { useState } from 'react';
import { SendOutlined, ReloadOutlined, UserOutlined, MessageOutlined, DesktopOutlined } from '@ant-design/icons';
import { MessageItemType, MessageRoleType, consts, svgs } from 'ice-core';
import { Input, Button, Form } from 'antd-mobile';

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
            <svgs.OpenAI width='2.25rem' height='2.25rem' />
        </div>);
    }
    else if (props.role == 'customer-service') {
        icon = (<div className="flex items-center text-purple-600 text-4xl" style={{ height: 29 }}>
            <svgs.QA width='2.25rem' height='2.25rem' />
        </div>);
    }
    else {
        icon = (<div className='flex items-center' style={{ height: 29 }}>
            <UserOutlined className='text-blue-600 text-4xl' />
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
            <div className='border rounded-md border-slate-200 border-solid p-4 text-slate-400 mt-2 whitespace-pre-line'>
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
            <div className='w-8 shrink-0 grow-0' />
        </div>
    }
}

type Props = {
    currentRole: MessageItemType['role'],
    messages: Array<MessageItemType>,
    fetchSendMessage: (message: string) => Promise<void>,
    clearMessages: () => void,
    tools?: React.ReactNode,
    showOriginal?: boolean,
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
        return <div className='flex flex-col gap-4 rounded-md h-full overflow-y-hidden'>
            <div ref={r => this.messageListRef = r} className='flex p-4 flex-col gap-4 grow shrink overflow-y-auto ice-scrollbar'
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
            <div className='grow-0 shrink-0'>
                <div className='flex mb-1 items-center'>
                    {this.props.tools}
                    <div className='grow' />
                    <Button fill='none' onClick={this.props.clearMessages}><ReloadOutlined /></Button>
                    <Button fill='none' disabled={!this.state.message} onClick={() => {
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
                    }}><SendOutlined /></Button>
                </div>
                <Form layout='horizontal' style={{
                    '--prefix-width': '30px'
                }}>
                    <Form.Item label={<MessageOutlined />}>
                        <Input
                            className='shrink grow rounded-full'
                            placeholder='有问题尽管问我...'
                            maxLength={consts.LargerTextLength}
                            value={this.state.message}
                            onChange={(e) => {
                                this.setState({ message: e });
                            }}
                            onEnterPress={() => {
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
                            }}
                        />
                    </Form.Item>
                </Form>
            </div>
        </div>
    }
}

export default MessageBox;