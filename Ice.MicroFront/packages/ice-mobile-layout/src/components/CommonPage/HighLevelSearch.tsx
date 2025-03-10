import React, { useState } from 'react';
import { ReloadOutlined, FileSearchOutlined, DownOutlined } from '@ant-design/icons';
import { Input, DatePicker, Button, Form } from 'antd-mobile';
import ActionSelect from '../ActionSelect';
import DateRangePicker from '../DateRangePicker';

export type DateRange = [Date, Date]

export type NumRange = [number, number]

export type fliterProps = {
    setValue: (value: any) => void,
    value: any,
}

export const TextFilter = (props: fliterProps & {
    isNumber?: boolean
}) => {
    let { value, setValue, isNumber } = props;

    return <Input
        placeholder='请输入'
        value={value}
        onChange={e => setValue(e)}
    />
}

export const TimeFilter = (props: fliterProps) => {
    let { value, setValue } = props;

    let range: DateRange = value || [undefined, undefined];

    return <DateRangePicker 
        value={range}
        onChange={setValue}
    />
}

export const SelectFilter = (props: fliterProps & {
    filterValues: Array<{ label: string, value: string | number | boolean }>
}) => {
    let { value, setValue, filterValues } = props;

    return <div className='flex'>
        <ActionSelect
            options={props.filterValues as Array<any>}
            value={value}
            onChange={(val) => {
                setValue(val);
            }}
        />
    </div>
}

export type FilterColumnType = {
    title: string,
    dataIndex: string,
    filter: React.ComponentType<fliterProps>,
    show?: boolean
}

type Props = {
    defaultFilters?: any,
    columns: Array<FilterColumnType>
    onChange: (values: any) => void;
    btns?: React.ReactNode
}

export default class extends React.Component<Props> {
    state: any;

    constructor(props: Props) {
        super(props);
        let state = {
            isVisible: false
        };
        if (props.defaultFilters) {
            state = {
                ...state,
                ...props.defaultFilters
            }
        }
        this.state = state;
    }

    render() {
        return <div>
            {
                this.state.isVisible &&
                <Form className='mb-4'>
                    {
                        this.props.columns.map(item => {
                            let Filter = item.filter;
                            let value = this.state[item.dataIndex];

                            return (
                                <Form.Item label={item.title}>
                                    <Filter
                                        value={this.state[item.dataIndex]}
                                        setValue={(value) => {
                                            let state: any = {};
                                            state[item.dataIndex] = value;
                                            this.setState(state);
                                        }}
                                    />
                                </Form.Item>
                            )
                        })
                    }
                </Form>
            }
            <div className='flex gap-4'>
                <Button
                    onClick={() => {
                        let { isVisible, ...other } = this.state;
                        Object.keys(other).forEach(key => {
                            other[key] = undefined;
                        });
                        this.setState(other);
                        this.props.onChange(other);
                    }}
                ><ReloadOutlined /></Button>
                <Button
                    onClick={() => {
                        let { isVisible, ...other } = this.state;
                        this.props.onChange(other);
                    }}
                ><FileSearchOutlined /></Button>
                <div className='flex-grow'></div>
                <Button onClick={() => this.setState({ isVisible: !this.state.isVisible })}><DownOutlined /></Button>
            </div>
        </div>
    }
}