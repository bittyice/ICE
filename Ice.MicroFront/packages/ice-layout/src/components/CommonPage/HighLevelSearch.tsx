import React from 'react';
import { Col, Row, Space, Button, Modal, Input, InputNumber, Radio, DatePicker, CheckboxOptionType, Checkbox, Select } from 'antd';
import { ReloadOutlined, FileSearchOutlined, SyncOutlined, SecurityScanOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

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

    if (isNumber == true) {
        return <InputNumber
            bordered={false}
            className='bg-gray-100 w-full'
            placeholder='输入文本'
            controls={false}
            value={value}
            onChange={val => setValue(val)}
        />
    }

    return <Input
        placeholder='输入文本'
        className='bg-gray-100'
        bordered={false}
        value={value}
        onChange={e => setValue(e.target.value)}
    />
}

export const TimeFilter = (props: fliterProps) => {
    let { value, setValue } = props;

    let range: DateRange = value || [undefined, undefined]

    return <div className='flex items-center'>
        <DatePicker
            bordered={false}
            className='bg-gray-100 w-1/2'
            placeholder='选择日期'
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            value={range[0] ? dayjs(range[0]) : undefined}
            onChange={(value) => {
                setValue([value?.toDate(), range[1]]);
            }}
        />
        -
        <DatePicker
            bordered={false}
            placeholder='选择日期'
            className='bg-gray-100 w-1/2'
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            value={range[1] ? dayjs(range[1]) : undefined}
            onChange={(value) => {
                setValue([range[0], value?.toDate()]);
            }}
        />
    </div>
}

export const ChecksFilter = (props: fliterProps & {
    filterValues: Array<CheckboxOptionType | string>
}) => {
    let { value, setValue, filterValues } = props;

    return <div className='flex'>
        <Checkbox.Group
            options={filterValues}
            value={value}
            onChange={(vals: any) => {
                setValue(vals);
            }}
        >
        </Checkbox.Group>
    </div>
}

export const RadioFilter = (props: fliterProps & {
    filterValues: Array<CheckboxOptionType>
}) => {
    let { value, setValue, filterValues } = props;

    return <div className='flex'>
        <Radio.Group
            value={value}
            onChange={(e) => {
                setValue(e.target.value);
            }}
        >
            {
                filterValues.map(item => (<Radio key={item.value as any} value={item.value} disabled={item.disabled}>{item.label}</Radio>))
            }
        </Radio.Group>
    </div>
}

export const SelectFilter = (props: fliterProps & {
    filterValues: Array<{ label: string, value: string | number | boolean | number }>
}) => {
    let { value, setValue, filterValues } = props;

    return <div className='flex'>
        <Select
            bordered={false}
            className='bg-gray-100'
            showSearch
            allowClear
            placeholder='选择选项'
            style={{ minWidth: 180 }}
            value={value}
            onChange={(val) => {
                setValue(val);
            }}
            filterOption={(input, option) => {
                return option?.title?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            }}
        >
            {
                filterValues.map(item => (<Select.Option key={item.value as any} value={item.value} title={item.label}>{item.label}</Select.Option>))
            }
        </Select>
    </div>
}

export const NumFilter = (props: fliterProps) => {
    let { value, setValue } = props;

    let range: NumRange = value || [undefined, undefined]

    return <div className='flex items-center'>
        <InputNumber
            bordered={false}
            className='bg-gray-100 flex-grow'
            placeholder='最小值'
            max={99999999}
            value={range[0]}
            onChange={(value) => {
                setValue([value, range[1]]);
            }}
        />
        -
        <InputNumber
            bordered={false}
            className='bg-gray-100 flex-grow'
            placeholder='最大值'
            max={99999999}
            value={range[1]}
            onChange={(value) => {
                setValue([range[0], value]);
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

const LabelEX = class extends React.Component<{
    text: React.ReactNode,
    children: React.ReactNode,
}> {
    render() {
        return <div className='flex items-center'>
            <span className='inline-block shrink-0 mr-2 pl-3 pr-3 pt-1 pb-1 rounded-md'>{this.props.text}</span>
            {this.props.children}
        </div>
    }
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
        if (props.defaultFilters) {
            this.state = {
                isModalVisible: false,
                ...props.defaultFilters
            }
        }
        else {
            this.state = {
                isModalVisible: false,
            }
        }
    }

    render() {
        return <div className='flex gap-1 items-center'>
            <Space>
                <Button type='link'
                    onClick={() => {
                        this.setState({ isModalVisible: true });
                    }}
                ><SecurityScanOutlined /></Button>
                <Button
                    type='text'
                    title='重置'
                    onClick={() => {
                        let params = {} as any;
                        this.props.columns.forEach(item => {
                            params[item.dataIndex] = undefined;
                        });
                        this.setState(params);
                        this.props.onChange(params);
                    }}
                ><ReloadOutlined /></Button>
            </Space>
            <Space>
                {
                    this.props.columns.filter(item => item.show).map(item => {
                        let Filter = item.filter;

                        return (
                            <LabelEX text={item.title}>
                                <Filter
                                    value={this.state[item.dataIndex]}
                                    setValue={(value) => {
                                        let state: any = {};
                                        state[item.dataIndex] = value;
                                        this.setState(state);
                                    }}
                                />
                            </LabelEX>
                        )
                    })
                }
            </Space>
            <div className='flex-grow'></div>
            <Space>

                <Button
                    type='link'
                    onClick={() => {
                        let params = {} as any;
                        this.props.columns.forEach(item => {
                            params[item.dataIndex] = this.state[item.dataIndex];
                        });
                        this.props.onChange(params);
                    }}
                ><FileSearchOutlined /></Button>
            </Space>
            <Modal
                title='高级搜索'
                open={this.state.isModalVisible}
                width={850}
                onOk={() => {
                    let params = {} as any;
                    this.props.columns.forEach(item => {
                        params[item.dataIndex] = this.state[item.dataIndex];
                    });
                    this.props.onChange(params);

                    this.setState({ isModalVisible: false });
                }}
                onCancel={() => {
                    this.setState({ isModalVisible: false });
                }}
            >
                <Row wrap={true}>
                    {
                        this.props.columns.map(item => {
                            let Filter = item.filter;

                            return (
                                <Col key={item.dataIndex} span={12} style={{ padding: 10 }}>
                                    <div style={{ marginBottom: 10 }}>{item.title}</div>
                                    <Filter
                                        value={this.state[item.dataIndex]}
                                        setValue={(value) => {
                                            let state: any = {};
                                            state[item.dataIndex] = value;
                                            this.setState(state);
                                        }}
                                    />
                                </Col>
                            )
                        })
                    }
                </Row>
            </Modal>
        </div>
    }
}