import React, { useState, useEffect } from 'react';
import { Empty, Space, Input, Button, Popover, Tag } from 'antd';
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons';

import './index.css';

type ExtraInfoType = { label: string, value: string }

type Props = {
    extraInfo?: string,
    onChange: (extraInfo: string) => void,
    itemWidth?: string | number,
    show?: boolean
}

// 字段分隔符
const fieldSplit = '\n';
// 键值分隔符
const keyValueSplit = '\t';

export default class extends React.Component<Props> {
    state: {
        saved: boolean,
        extraInfos: Array<ExtraInfoType>
    }

    constructor(props: Props) {
        super(props);

        let extraInfos: Array<ExtraInfoType> = parseExtraInfo(props.extraInfo);

        this.state = {
            saved: true,
            extraInfos: extraInfos
        }
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): boolean {
        if (!this.props.extraInfo && !!nextProps.extraInfo) {
            let extraInfos: Array<ExtraInfoType> = parseExtraInfo(nextProps.extraInfo);
            this.setState({ extraInfos });
        }
        return true;
    }

    submitChange = () => {
        this.props.onChange(this.state.extraInfos.map(item => `${item.label}${keyValueSplit}${item.value}`).join(fieldSplit));
        this.setState({ saved: true });
    }

    render(): React.ReactNode {
        return <div className='extra-info'>
            {
                this.props.show == true && this.state.extraInfos.length == 0 &&
                <Empty style={{ margin: 'auto' }} />
            }
            {
                this.state.extraInfos.map((item, index) => (<div style={{ width: this.props.itemWidth }} className='extra-info-item'>
                    <Input
                        bordered={false}
                        readOnly={this.props.show}
                        placeholder='请输入名称'
                        value={item.label}
                        onChange={e => {
                            item.label = e.currentTarget.value;
                            this.setState({ saved: false });
                        }}
                    />
                    <Input
                        bordered={false}
                        readOnly={this.props.show}
                        placeholder='请输入值'
                        value={item.value}
                        onChange={e => {
                            item.value = e.currentTarget.value;
                            this.setState({ saved: false });
                        }}
                    />
                    {
                        this.props.show != true &&
                        <Button danger icon={<DeleteOutlined />}
                            onClick={() => {
                                let extraInfos = [...this.state.extraInfos];
                                extraInfos.splice(index, 1);
                                this.setState({ extraInfos, saved: false });
                            }}
                        />
                    }
                </div>))
            }
            {
                this.props.show != true &&
                <div style={{ width: this.props.itemWidth }} className='extra-info-btns'>
                    <Button type='dashed' block onClick={() => {
                        let extraInfos = [...this.state.extraInfos];
                        extraInfos.push({
                            label: '',
                            value: ''
                        });
                        this.setState({ extraInfos, saved: false });
                    }}>添加字段</Button>
                    <Button style={{ boxShadow: this.state.saved ? undefined : '0px 0px 3px #ff7875' }} danger={!this.state.saved} ghost type='primary' icon={<SaveOutlined />} onClick={this.submitChange}>{!this.state.saved ? '* 点我保存' : ''}</Button>
                </div>
            }
        </div>
    }
}

export function parseExtraInfo(extraInfo: string | undefined) {
    try {
        let extraInfos: Array<{ label: string, value: string }> = [];
        if (!extraInfo) {
            return extraInfos;
        }
        var arr = extraInfo.split(fieldSplit);
        for (let item of arr) {
            const [key, value] = item.split(keyValueSplit);
            extraInfos.push({
                label: key,
                value: value
            });
        }
        return extraInfos;
    }
    catch (ex) {
        return [];
    }
}

export const ExtraInfoShow = (props: { extraInfo: string }) => {
    const [extraInfos, setExtraInfos] = useState<Array<ExtraInfoType>>([]);

    useEffect(() => {
        let extraInfos: Array<ExtraInfoType> = parseExtraInfo(props.extraInfo);
        setExtraInfos(extraInfos);
    }, []);

    return <div className='extra-info'>
        {
            extraInfos.map((item, index) => (<div className='extra-info-itemshow'>
                <Tag>{item.label}</Tag>
                <div>{item.value}</div>
            </div>))
        }
    </div>
}