import React, { useState } from 'react';
import { DatePicker, Card, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, CsTextApi, CsTextEntity } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { CloseOutlined } from '@ant-design/icons';

type TextListProps = {
    value: Array<string>,
    onChange: (arr: Array<string>) => void,
}

const TextList = ({ value, onChange }: TextListProps) => {
    const [input, setInput] = useState('');

    return <div className='flex flex-col w-full gap-2'>
        {
            value.map((item, index) => (<div key={`${item}_${index}`}
                className='p-2'
            >
                <span>{item}</span>
                <CloseOutlined className='ml-2 cursor-pointer'
                    onClick={() => {
                        let newValue = [...value];
                        newValue.splice(index, 1);
                        onChange(newValue);
                    }}
                />
            </div>))
        }
        <Input
            key='input'
            style={{ width: '100%' }}
            placeholder='请输入话术，按回车结束'
            bordered={false}
            maxLength={200}
            value={input}
            onChange={(e) => {
                setInput(e.currentTarget.value);
            }}
            onKeyDown={(event) => {
                if (event.code == 'Enter' && input) {
                    let newValue = [...value];
                    newValue.push(input);
                    onChange(newValue);
                    setInput('');
                }
            }}
        />
    </div>
}

type Props = {
    entity?: CsTextEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
};

class PageModal extends React.Component<{
    title: string,
    onSubmit: (entity: any) => Promise<void>,
} & Props> {
    state = {
        loading: false,
        entity: {
        } as CsTextEntity,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return CsTextApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
        }).catch((ex) => {
        });
    }

    checkForm = () => {
        if (!this.state.entity.groupName) {
            message.error('请输入名称');
            return false;
        }

        if (!this.state.entity.textList) {
            message.error('请添加话术列表');
            return false;
        }

        return true;
    }

    render() {
        return <Modal
            title={this.props.title}
            open={this.props.open}
            confirmLoading={this.state.loading}
            maskClosable={false}
            width={400}
            onCancel={this.props.onCancel}
            onOk={() => {
                if (!this.checkForm()) {
                    return;
                }

                this.setState({ loading: true });
                return this.props.onSubmit(this.state.entity).finally(() => {
                    this.setState({ loading: false });
                });
            }}
        >
            <div>
                <CardEX title='基本信息' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX isMust text={'名称'} style={{ width: '100%' }}>
                        <Input
                            placeholder='名称'
                            value={this.state.entity.groupName}
                            maxLength={30}
                            showCount
                            onChange={(e) => {
                                this.state.entity.groupName = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                </CardEX>
                <CardEX title='话术列表' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <TextList
                        value={this.state.entity.textList ? this.state.entity.textList.split('\n') : []}
                        onChange={(arr) => {
                            this.state.entity.textList = arr.join('\n');
                            this.setState({});
                        }}
                    />
                </CardEX>
            </div>
        </Modal>
    }
}

export const Edit = OpenNewKey((props: Props) => {
    const onSubmit = async (entity: any) => {
        await CsTextApi.update(entity);
        message.success('成功');
        props.onOk();
    }

    return <PageModal
        {...props}
        title={`编辑`}
        onSubmit={onSubmit}
    />
})

export const Add = OpenNewKey((props: Props) => {
    const onSubmit = async (entity: any) => {
        await CsTextApi.create(entity);
        message.success('成功');
        props.onOk();
    }

    return <PageModal
        {...props}
        title='添加'
        onSubmit={onSubmit}
    />
})