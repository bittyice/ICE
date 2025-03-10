import React, { ReactPropTypes, useEffect, useState } from 'react';
import { Modal, message, Select, Popover, DatePicker, notification, Space } from 'antd';
import { NumberOutlined, SyncOutlined, UserOutlined, ExportOutlined, DeleteOutlined } from '@ant-design/icons';
import { Row, Pagination, Table, Button } from 'antd';
import { HighLevelSearch, TextFilter, TimeFilter, OpenNewKey, exportXLSX } from 'ice-layout';
import { QuestionnaireResultApi, QuestionnaireResultEntity, QuestionnaireApi, classifySlice, consts, svgs, qaTagSlice, QaTagApi } from 'ice-core';
import type { IceStateType, MessageItemType, MessageRoleType, QaTagEntity } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import { Tool } from 'ice-common';
import dayjs, { Dayjs } from 'dayjs';

const QaTagSelect = (props: {
    tag?: string,
    onSelect: (product: QaTagEntity | null) => void,
    qaTags: Array<QaTagEntity>,
}) => {
    const filterOption = (input: string, option: { label: string; value: string } | undefined) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    return <Select
        showSearch
        placeholder='输入或选择标签'
        style={{width: '100%'}}
        bordered={false}
        filterOption={filterOption}
        options={props.qaTags.map(item => ({
            value: item.name!,
            label: item.name!
        }))}
        value={props.tag}
        onChange={(name, option) => {
            const qaTag = props.qaTags.find(e => e.name === name);
            if (qaTag) {
                props.onSelect(qaTag);
            }
        }}
    />
}

const MessageItem = (props: {
    role: string,
    content: string,
}) => {
    let icon;
    if (props.role == 'assistant') {
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

    const messageContent = (<div className={`flex flex-col items-start}`}>
        <div className='border rounded-md border-slate-200 border-solid pt-1 pb-1 pl-2 pr-2 bg-white whitespace-pre-line'>
            {props.content}
        </div>
    </div>)

    return <div className='flex gap-4 items-start'>
        {icon}
        {messageContent}
    </div>
}

const ChatRecords = OpenNewKey((props: {
    id: string,
    open: boolean,
    onCancel: () => void,
}) => {
    const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([]);

    useEffect(() => {
        QuestionnaireResultApi.get(props.id).then(data => {
            let messages: Array<{ role: string, content: string }> = [];
            let regex = /^(user|assistant|customer-service):(.*)/;

            let chatRecords = data.chatRecords?.split('\n');
            if (!chatRecords) {
                return;
            }
            for (let chatRecord of chatRecords) {
                let results = regex.exec(chatRecord);
                if (!results) {
                    continue;
                }
                messages.push({
                    role: results[1],
                    content: results[2]
                });
            }

            setMessages(messages);
        });
    }, []);

    return <Modal
        title="聊天记录"
        open={props.open}
        onCancel={props.onCancel}
        footer={null}
    >
        <div className='flex flex-col gap-4 mt-4'>
            {
                messages.map(item => (<MessageItem {...item} />))
            }
        </div>
    </Modal>
})

const ExportDatas = OpenNewKey((props: {
    open: boolean,
    onCancel: () => void,
    onOk: (dateRange: [Date, Date]) => void,
}) => {
    const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);

    const submit = async () => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) {
            message.error('请选择时间');
            return;
        }

        let start = new Date(dateRange[0].getFullYear(), dateRange[0].getMonth(), dateRange[0].getDate());
        let end = new Date(dateRange[1].getFullYear(), dateRange[1].getMonth(), dateRange[1].getDate(), 23, 59, 59);
        props.onOk([start, end]);
    }

    return <Modal
        title='导出数据'
        open={props.open}
        onCancel={props.onCancel}
        onOk={submit}
        width={300}
    >
        <div className='mb-2'>
            选择导出时间
        </div>
        <DatePicker.RangePicker
            value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
            onChange={values => {
                if (values == null || !values[0] || !values[1]) {
                    setDateRange(null);
                    return;
                }
                setDateRange([values[0].toDate(), values[1].toDate()]);
            }}
        />
    </Modal>
})

type QuestionnaireResultEntityEx = {
    [k: string]: string
} & QuestionnaireResultEntity

class QuestionnaireResult extends React.Component<{
    qaTags: Array<QaTagEntity>
}> {
    commonColumns = [
        // {
        //     title: '称呼',
        //     key: 'guestName',
        //     dataIndex: 'guestName',
        // },
        // {
        //     title: '手机号',
        //     key: 'phone',
        //     dataIndex: 'phone',
        // },
        {
            title: 'IP',
            key: 'ip',
            dataIndex: 'ip',
        },
        {
            title: '所属省份',
            key: 'province',
            dataIndex: 'province',
        },
        {
            title: '创建时间',
            key: 'creationTime',
            dataIndex: 'creationTime',
            fixed: 'right',
            width: 150,
            render: (val) => {
                return Tool.dateFormat(val);
            }
        },
        {
            title: '标签',
            key: 'tagName',
            dataIndex: 'tagName',
            fixed: 'right',
            width: 120,
            render: (val, row) => {
                return <QaTagSelect 
                    tag={row.tagName}
                    qaTags={this.props.qaTags}
                    onSelect={async (tag) => {
                        await QuestionnaireResultApi.setTagName({
                            id: row.id,
                            tagName: tag?.name
                        });
                        await this.fetchDatas();
                    }}
                />;
            }
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (val, row) => {
                return <Space>
                    <Button size='small' type='link' onClick={() => this.setState({ row: row, showChatRecords: true })}>聊天记录</Button>
                    <Button size='small' danger type='text' icon={<DeleteOutlined />}
                        onClick={() => {
                            this.fetchDelete(row);
                        }}
                    ></Button>
                </Space>
            }
        }
    ];

    state = {
        isLoading: false,
        // 选择的数据行
        selectRows: [] as Array<QuestionnaireResultEntityEx>,
        // 
        filter: {} as any,
        // 
        total: 0,
        pageSize: 30,
        page: 1,
        datas: [] as Array<QuestionnaireResultEntityEx>,
        columns: [{
            title: <NumberOutlined />,
            key: 'index',
            fixed: 'left',
            width: 40,
            render: (val, row, index) => {
                return index + 1;
            }
        },
        ...this.commonColumns
        ] as Array<any>,
        row: null as (QuestionnaireResultEntityEx | null),
        columnWidth: undefined as (number | undefined),
        showChatRecords: false,
        showExportDatas: false,
    }

    filterColumn: Array<any> = [{
        title: '时间',
        dataIndex: 'creationTime',
        show: true,
        filter: TimeFilter
    }];

    componentDidMount(): void {
        this.fetchDatas();
        this.fetchQuestionnaires();
    }

    questionnaireResultsToEx = (datas: Array<QuestionnaireResultEntity>) => {
        let newDatas: Array<QuestionnaireResultEntityEx> = [];
        for (let i = 0; i < datas.length; i++) {
            let item = datas[i];
            let newData: QuestionnaireResultEntityEx = {
                ...item
            };
            let questions = item.questions?.split('\n') || [];
            let answers = item.results?.split('\n') || [];
            for (let j = 0; j < questions.length; j++) {
                let question = questions[j].trim();
                newData[question] = answers[j];
            }
            newDatas.push(newData);
        }

        return newDatas;
    }

    fetchQuestionnaires = async () => {
        let res = await QuestionnaireApi.getList(1, consts.PageSizeLength);
        const questionnaires = res.datas;
        let columns: Array<any> = [];
        let columnWidth = 800;
        columns.push({
            title: <NumberOutlined />,
            key: 'index',
            fixed: 'left',
            width: 40,
            render: (val, row, index) => {
                return index + 1;
            }
        });
        for (let n = 0; n < questionnaires.length; n++) {
            let questionnaire = questionnaires[n];
            const question = questionnaire.question?.trim();
            columns.push({
                title: question,
                key: n,
                dataIndex: question,
            });
            columnWidth = columnWidth + 200;
        }

        this.setState({ columns: columns.concat(this.commonColumns), columnWidth });
    }

    fetchDatas = async () => {
        let res = await QuestionnaireResultApi.getList(this.state.page, this.state.pageSize, this.state.filter, 'creationTime', 'descend');

        // 解析数据
        let datas = res.datas;
        let newDatas: Array<QuestionnaireResultEntityEx> = this.questionnaireResultsToEx(datas);

        this.setState({
            total: res.total,
            datas: newDatas
        });
    }

    fetchExports = async (dates: [Date, Date]) => {
        this.setState({ showExportDatas: false });

        notification.warning({
            message: '正在导出数据！',
            description: '正在导出数据，请不要关闭或切换当前页面',
            duration: null
        });

        let page = 1;
        let datas: Array<QuestionnaireResultEntity> = [];
        while (true) {
            let res = await QuestionnaireResultApi.getList(page, 50, {
                creationTime: dates,
            }, 'creationTime', 'descend');
            if (res.datas.length === 0) {
                break;
            }
            datas = datas.concat(res.datas);
            page++;
        }

        let newDates = this.questionnaireResultsToEx(datas);

        let exportDatas = [] as Array<any>;
        let titles = {} as any;
        for (let column of this.state.columns) {
            if (!column.dataIndex) {
                continue;
            }
            titles[column.dataIndex] = column.title;
        }
        exportDatas.push(titles);

        for (let newDate of newDates) {
            let exportData = {} as any;
            for (let column of this.state.columns) {
                if (!column.dataIndex) {
                    continue;
                }
                exportData[column.dataIndex] = newDate[column.dataIndex];
            }
            if (exportData.creationTime) {
                exportData.creationTime = Tool.dateFormat(exportData.creationTime);
            }
            exportDatas.push(exportData);
        }

        exportXLSX(exportDatas, undefined, '调查问卷.xlsx');
        notification.success({
            message: '导出完成！',
            description: '数据已导出，你可以关闭或切换页面了',
            duration: null
        });
    }

    // 删除
    fetchDelete = (row: any) => {
        Modal.confirm({
            title: `删除`,
            content: '确认删除吗？',
            onOk: async () => {
                await QuestionnaireResultApi.delete(row.id);
                message.success('删除成功');
                this.fetchDatas();
            }
        });
    }

    render() {
        return <div style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
        }}>
            <div className='w-full' style={{
                marginBottom: '0.5rem',
                backgroundColor: '#fff',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                paddingLeft: '0.75rem',
                paddingRight: '0.75rem',
                borderRadius: '0.5rem'
            }}>
                <HighLevelSearch
                    columns={this.filterColumn}
                    onChange={(filter) => {
                        this.setState({ filter }, () => {
                            this.fetchDatas();
                        });
                    }}
                />
            </div>
            <div className='w-full' style={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                flexShrink: 100,
                marginBottom: '0.5rem',
                backgroundColor: '#fff',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                paddingLeft: '0.75rem',
                paddingRight: '0.75rem',
                borderRadius: '0.5rem'
            }}>
                <Row justify='space-between' style={{ gap: 8, alignItems: 'center', marginBottom: 8, justifyContent: 'flex-end' }}>
                    <Button icon={<ExportOutlined />} type='link' onClick={() => this.setState({ showExportDatas: true })}>导出数据</Button>
                </Row>
                <div
                    className='w-full'
                    style={{
                        display: 'flex',
                        flexGrow: 1,
                        flexShrink: 100,
                        overflowY: 'hidden',
                    }}>
                    <Table
                        className='w-full'
                        rowKey='id'
                        bordered
                        loading={this.state.isLoading}
                        columns={this.state.columns}
                        dataSource={this.state.datas}
                        pagination={false}
                        scroll={{
                            x: this.state.columnWidth,
                        }}
                        rowSelection={{
                            selectedRowKeys: this.state.selectRows.map(item => item.id!),
                            onChange: (selectedRowKeys, selectedRows) => {
                                this.setState({
                                    selectRows: selectedRows
                                });
                            },
                            checkStrictly: false,
                        }}
                    />
                </div>
            </div>
            <Row>
                <div style={{ flexGrow: 1 }} />
                <Pagination
                    disabled={this.state.isLoading}
                    total={this.state.total}
                    pageSize={this.state.pageSize}
                    current={this.state.page}
                    showSizeChanger
                    pageSizeOptions={['10', '30', '50', '100']}
                    showQuickJumper
                    showTotal={total => <div>
                        <span style={{ marginLeft: '1rem' }}>{`共 ${total} 条`}</span>
                    </div>}
                    onChange={(page, pageSize) => {
                        this.setState({
                            page,
                            pageSize
                        }, () => {
                            this.fetchDatas();
                        });
                    }}
                />
            </Row>
            {
                this.state.row &&
                <ChatRecords
                    id={this.state.row.id!}
                    open={this.state.showChatRecords}
                    onCancel={() => this.setState({ showChatRecords: false })}
                />
            }
            <ExportDatas
                open={this.state.showExportDatas}
                onCancel={() => this.setState({ showExportDatas: false })}
                onOk={this.fetchExports}
            />
        </div>
    }
}

export default () => {
    const qaTags = useSelector((state: IceStateType) => state.qaTag.allDatas) || [];
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(qaTagSlice.asyncActions.fetchAllDatas({}) as any);
    }, []);
    
    return <QuestionnaireResult qaTags={qaTags} />
}