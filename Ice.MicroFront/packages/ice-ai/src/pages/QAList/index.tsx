import React, { useEffect, useRef, useState } from 'react';
import { Space, Button, Table, message, Input, Upload, Select, TableColumnType, Modal, notification } from 'antd';
import { NumberOutlined, DeleteOutlined } from '@ant-design/icons';
import { iceFetch } from 'ice-common';
import PdfImport from './PdfImport';
import { consts, QaApi, QAType } from 'ice-core';
import { ActionList, exportXLSX, ImportExcelModal, LabelEX, OpenNewKey } from 'ice-layout';
// @ts-ignore
import template from './template.xlsx';

const questionMaxLength = consts.MediumTextLength;
const answerMaxLength = 500;
const notificationKey = "QaExcelImportKey"

const AddOrEdit = OpenNewKey((props: {
    entity?: QAType,
    open: boolean,
    onCancel: () => void,
    onOk: () => void
}) => {
    const [question, setQuestion] = useState<string | undefined>(props.entity?.question);
    const [answer, setAnswer] = useState<string | undefined>(props.entity?.answer);
    const [href, setHref] = useState<string | undefined>(props.entity?.additionalMetadataObj?.href);
    const [loading, setLoading] = useState(false);

    const fetchCommit = async () => {
        if (!question) {
            message.error('请填写标题');
            return;
        }
        if (!answer) {
            message.error('请填写描述');
            return;
        }
        setLoading(true);
        try {
            if (!props.entity) {
                await QaApi.add({
                    question: question,
                    answer: answer,
                    href: href
                });
            }
            else {
                await QaApi.update({
                    id: props.entity.id!,
                    question: question,
                    answer: answer,
                    href: href
                })
            }

            message.success('成功');
            props.onOk();
        }
        catch (e) {
        }
        setLoading(false);
    }

    return <Modal
        title='添加QA'
        confirmLoading={loading}
        open={props.open}
        onCancel={props.onCancel}
        onOk={fetchCommit}
    >
        <div className='flex flex-col gap-4 pb-6'>
            <div className='flex flex-col gap-2'>
                <div>标题</div>
                <Input
                    placeholder='请输入标题'
                    maxLength={questionMaxLength}
                    showCount
                    value={question}
                    onChange={(e) => {
                        setQuestion(e.target.value);
                    }}
                />
            </div>
            <div className='flex flex-col gap-2'>
                <div>描述</div>
                <Input.TextArea
                    placeholder='请输入描述'
                    maxLength={answerMaxLength}
                    showCount
                    value={answer}
                    onChange={(e) => {
                        setAnswer(e.target.value);
                    }}
                />
            </div>
            <div className='flex flex-col gap-2'>
                <div>附加连接</div>
                <Input
                    placeholder='请输入附加连接'
                    maxLength={consts.MediumTextLength}
                    showCount
                    value={href}
                    onChange={(e) => {
                        setHref(e.target.value);
                    }}
                />
            </div>
        </div>
    </Modal>
})

class AmountAdjust extends React.Component {
    state = {
        pageSize: 50,
        nextId: null,
        qas: [] as Array<QAType>,
        loading: false,
        showAddOrEdit: false,
        showPdfImport: false,
        pdfImportKey: 0,
        question: '',
        editEntity: undefined as (QAType | undefined)
    }

    columns: Array<TableColumnType<any>> = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '标题',
        dataIndex: 'question',
        key: 'question',
        width: 150,
    }, {
        title: '描述',
        dataIndex: 'answer',
        key: 'answer',
    }, {
        title: '附加连接',
        dataIndex: 'href',
        key: 'href',
        width: 80,
        render: (val, row) => {
            let href = row.additionalMetadataObj?.href;
            if (!href) {
                return null;
            }
            return <a target='_blank' href={row.additionalMetadataObj?.href}>点我跳转</a>;
        }
    }, {
        title: '操作',
        key: 'action',
        width: 120,
        render: (val, row, index) => {
            return <Space>
                <Button size='small' type='link'
                    onClick={() => {
                        this.setState({
                            showAddOrEdit: true,
                            editEntity: row
                        });
                    }}
                >编辑</Button>
                <Button type='text' danger size='small' icon={<DeleteOutlined />} onClick={() => this.fetchDelete(row)}></Button>
            </Space>
        }
    }];

    componentDidMount(): void {
        this.fetchDatas();
    }

    fetchDatas = async () => {
        this.setState({ loading: true });
        try {
            let question = this.state.question;
            let offsetId = this.state.nextId;

            let result = await QaApi.getList({
                question: question,
                offsetId: offsetId,
                limit: this.state.pageSize
            });

            this.setState({
                nextId: result.nextPageOffsetId,
                qas: [...this.state.qas, ...result.items]
            });
        }
        catch (e) { }
        this.setState({
            loading: false,
        });
    }

    fetchDelete = async (row: QAType) => {
        Modal.confirm({
            title: `你正在删除 ${row.question}`,
            content: `请确认操作 ！！！`,
            onOk: async () => {
                await QaApi.delete(row.id);
                message.success('删除成功');
                this.setState({
                    nextId: null,
                    qas: []
                }, () => {
                    this.fetchDatas();
                });
            }
        })
    }

    fetchDeleteAll = async () => {
        Modal.confirm({
            title: `你正在删除所有问答！`,
            content: `请确认操作 ！！！`,
            onOk: () => {
                Modal.confirm({
                    title: `你正在删除所有问答！`,
                    content: `请再次确认操作 ！！！`,
                    onOk: async () => {
                        Modal.confirm({
                            title: `你正在删除所有问答！`,
                            content: `请再三确认操作 ！！！该操作不可撤销！`,
                            onOk: async () => {
                                await QaApi.deleteAll();
                                message.success('删除成功');
                                this.setState({
                                    nextId: null,
                                    qas: []
                                }, () => {
                                    this.fetchDatas();
                                });
                            }
                        })
                    }
                })
            }
        })
    }

    fetchExports = async () => {
        let result = await QaApi.getList({
            offsetId: null,
            limit: 9999
        });

        let exportDatas: Array<{ question: string, answer: string, href?: string }> = result.items.map(item => {
            return {
                question: item.question,
                answer: item.answer,
                href: item.additionalMetadataObj?.href
            }
        });

        exportXLSX([
            { question: '标题', answer: '描述', href: '附加连接' },
            ...exportDatas
        ]);
    }

    fetchImportExcel = async (datas: Array<{ question: string, answer: string, href?: string }>) => {
        let [one, ...importDatas] = datas;
        // 检查数据
        for (let n = 0; n < importDatas.length; n++) {
            let qa = importDatas[n];
            if (!qa.question) {
                message.error(`第 ${n + 3} 行，请填写标题`);
                return;
            }
            if (qa.question.length > questionMaxLength) {
                message.error(`第 ${n + 3} 行，标题长度不能超过${questionMaxLength}个字符`);
                return;
            }

            if (!qa.answer) {
                message.error(`第 ${n + 3} 行，请填写描述`);
                return;
            }
            if (qa.answer.length > answerMaxLength) {
                message.error(`第 ${n + 3} 行，描述长度不能超过${answerMaxLength}个字符`);
                return;
            }
        }

        notification.info({
            key: notificationKey,
            message: '问答正在上传中...',
            description: '问答正在上传中，请不要关闭或切换菜单',
            duration: null,
        });
        for (let n = 0; n < importDatas.length; n++) {
            let qa = importDatas[n];
            try {
                await QaApi.add({
                    question: qa.question,
                    answer: qa.answer,
                    href: qa.href
                });
            }
            catch (ex) {
                notification.error({
                    message: `第 ${n + 3} 行 [${qa.question}]，问答上传失败`,
                    description: ex.responseData?.error?.message,
                    duration: null
                });
            }
        }
        notification.destroy(notificationKey);
        notification.success({
            message: '问答已上传成功',
            description: '问答已上传成功，如果有错误，请使用添加功能添加问答',
            duration: null,
        });

        this.setState({
            showPdfImport: false,
            nextId: null,
            qas: []
        }, () => {
            this.fetchDatas();
        });
    }

    render(): React.ReactNode {
        return <div>
            <div className='flex gap-2 mb-2 w-full p-2 bg-white rounded pl-4 pr-4'>
                <div className='flex items-center'>
                    <span className='shrink-0 mr-4'>标题</span>
                    <Input
                        style={{ width: 200 }}
                        placeholder='搜索'
                        value={this.state.question}
                        onChange={e => {
                            this.setState({ question: e.currentTarget.value });
                        }}
                    />
                </div>
                <Button type='link' onClick={() => {
                    this.setState({
                        nextId: null,
                        qas: []
                    }, () => {
                        this.fetchDatas();
                    });
                }}>搜索</Button>
                <div className='flex-grow'></div>
                <ActionList length={10}>
                    <Button type='link' onClick={() => {
                        this.setState({
                            showAddOrEdit: true,
                            editEntity: null,
                        })
                    }}>添加</Button>
                    <div>
                        <Button type='text' onClick={() => this.setState({ showPdfImport: true, pdfImportKey: this.state.pdfImportKey + 1 })}>导入PDF</Button>
                        <PdfImport
                            key={this.state.pdfImportKey}
                            open={this.state.showPdfImport}
                            onCancel={() => this.setState({ showPdfImport: false })}
                            onOk={() => {
                                this.setState({
                                    showPdfImport: false,
                                    nextId: null,
                                    qas: []
                                }, () => {
                                    this.fetchDatas();
                                });
                            }}
                        />
                    </div>
                    <ImportExcelModal
                        templateUrl={template}
                        onOk={this.fetchImportExcel}
                    >
                        <Button type='text'>导入EXCEL</Button>
                    </ImportExcelModal>
                    <Button type='text' onClick={() => {
                        Modal.confirm({
                            title: '导出数据',
                            content: '确认动作，点击确认后开始导出数据',
                            onOk: () => {
                                return this.fetchExports();
                            }
                        })
                    }}>导出数据</Button>
                    <Button type='text' danger onClick={this.fetchDeleteAll}>清空所有问答</Button>
                </ActionList>
            </div>
            <Table
                bordered
                columns={this.columns}
                dataSource={this.state.qas}
                pagination={false}
                footer={() => <Button size='large' loading={this.state.loading} disabled={!this.state.nextId} block onClick={this.fetchDatas}>加载更多</Button>}
            />
            <AddOrEdit
                entity={this.state.editEntity}
                open={this.state.showAddOrEdit}
                onCancel={() => this.setState({ showAddOrEdit: false })}
                onOk={() => {
                    this.setState({
                        showAddOrEdit: false,
                        nextId: null,
                        qas: []
                    }, () => {
                        this.fetchDatas();
                    });
                }}
            />
        </div>
    }
}

export default AmountAdjust;
