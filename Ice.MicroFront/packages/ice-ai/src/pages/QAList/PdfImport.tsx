import React, { useState } from 'react';
import { Modal, Upload, Button, message, Input, Card, Empty, notification } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import PDFJSWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';
import type { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';
import { iceFetch } from 'ice-common';
import { consts, QAType, QaApi } from 'ice-core';

console.log(PDFJSWorker);
// @ts-ignore
pdfjsLib.workerSrc = PDFJSWorker;

type QaImportType = { question: string, answer: string, href?: string };

const analyzePdf = async (pdfPath: string) => {
    let qas: Array<QaImportType> = [];

    const loadingTask = pdfjsLib.getDocument(pdfPath);
    let doc = await loadingTask.promise;
    const numPages = doc.numPages;
    console.log("# Document Loaded");
    console.log("Number of Pages: " + numPages);
    console.log();

    let data = await doc.getMetadata();
    console.log("# Metadata Is Loaded");
    console.log("## Info");
    console.log(JSON.stringify(data.info, null, 2));

    let lines: Array<{ text: string, height: number, width: number, isTitle: boolean, isEOL: boolean }> = [];
    let totalheight = 0;
    let count = 0;
    const loadPage = async function (pageNum) {
        let page = await doc.getPage(pageNum);

        let content = await page.getTextContent();
        for (let i = 0; i < content.items.length; i++) {
            let h = (content.items[i] as TextItem).height || 0;
            if (h > 0) {
                totalheight = totalheight + h;
                count++;
            }
        }

        let curLine = '';
        let curTH = 0;
        let curHCount = 0;
        let curW = 0;
        content.items.forEach((item) => {
            if ((item as TextMarkedContent).id) {
                return "";
            }

            let textItem = item as TextItem;

            // 追加字符
            if (textItem.height > 0 && textItem.str) {
                curLine = curLine + textItem.str;
                curTH = curTH + textItem.height;
                curHCount++;
                curW = curW + textItem.width;
            }

            // 如何存在换行符，则换行
            if (textItem.hasEOL) {
                lines.push({ text: curLine, height: curHCount == 0 ? 0 : curTH / curHCount, width: curW, isTitle: false, isEOL: true });
                curLine = '';
                curTH = 0;
                curHCount = 0;
                curW = 0;
                return;
            }
        });

        // 页尾没有换行符，需要手动判断
        if (curLine) {
            lines.push({ text: curLine, height: curHCount == 0 ? 0 : curTH / curHCount, width: curW, isTitle: false, isEOL: false });
        }

        // Release page resources.
        page.cleanup();
    };


    for (let i = 1; i <= numPages; i++) {
        await loadPage(i);
    }
    // await loadPage(265);

    // 整个PDF的平均字体高度，大于平均高度的将被认定为标题，小于平均高度的则被认定为内容
    let avgheight = totalheight / count;

    // 解析行是标题还是内容
    const fontsubnum = 4;
    for (let i = 0; i < lines.length; i++) {
        let curline = lines[i];
        if (curline.height > (avgheight + fontsubnum)) {
            curline.isTitle = true;
            continue;
        }
    }


    let curtitle = '';
    let curdes = '';
    for (let i = 0; i < lines.length; i++) {
        let prelineH = lines[i - 1] != undefined ? lines[i - 1].height : lines[i].height;
        let preIsTitle = lines[i - 1] != undefined ? lines[i - 1].isTitle : lines[i].isTitle;
        let curline = lines[i];

        // 如果当前行是内容，则追加 curdes
        if (curline.isTitle == false) {
            curdes = curdes + curline.text;
            if (curline.isEOL) {
                curdes = curdes + '\n';
            }
            continue;
        }

        // 如果当前行是标题 & 上一行是内容，则换QA
        if (preIsTitle == false) {
            if (curtitle) {
                qas.push({ question: curtitle, answer: curdes });
            }

            curtitle = curline.text;
            curdes = '';
            continue;
        }

        // 如果当前行是标题 & 上一行是标题 & 高度相差超过 fontsubnum，则换QA
        if (Math.abs(curline.height - prelineH) > fontsubnum) {
            if (curtitle) {
                qas.push({ question: curtitle, answer: curdes });
            }

            curtitle = curline.text;
            curdes = '';
            continue;
        }

        // 否则追加 curtitle
        curtitle = curtitle + curline.text;
    }
    // 最后一次
    if (curtitle) {
        qas.push({
            question: curtitle,
            answer: curdes
        });
    }
    console.log("平均高度", avgheight);
    console.log(qas);

    return qas;
}

const questionMaxLength = consts.MediumTextLength;
const answerMaxLength = 500;
const notificationKey = "PdfImportKey"

export default (props: {
    open: boolean,
    onCancel: () => void,
    onOk: () => void
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [qas, setQas] = useState<Array<QaImportType>>([
    ]);
    const [loading, setLoading] = useState(false);

    const handleUpload = async (file: File) => {
        let url = window.URL.createObjectURL(file);
        setLoading(true);
        try {
            let qas = await analyzePdf(url);
            setQas(qas);
        }
        catch (ex) {
            console.log(ex);
        }
        setLoading(false);
    };

    const onCommit = async () => {
        if (qas.length == 0) {
            message.error('未解析到任何问答');
            return;
        }

        // 检查
        for (let n = 0; n < qas.length; n++) {
            let qa = qas[n];
            if (!qa.question) {
                message.error(`请填写标题 ${n + 1}`);
                return;
            }
            if (qa.question.length > questionMaxLength) {
                message.error(`标题 ${n + 1} 长度不能超过${questionMaxLength}个字符`);
                return;
            }

            if (!qa.answer) {
                message.error(`请填写描述 ${n + 1}`);
                return;
            }
            if (qa.answer.length > answerMaxLength) {
                message.error(`描述 ${n + 1} 长度不能超过${answerMaxLength}个字符`);
                return;
            }
        }

        setLoading(true);
        notification.info({
            key: notificationKey,
            message: '问答正在上传中...',
            description: '问答正在上传中，请不要关闭窗口'
        });
        for (let n = 0; n < qas.length; n++) {
            let qa = qas[n];
            try {
                await QaApi.add({
                    question: qa.question,
                    answer: qa.answer,
                    href: qa.href
                });
            }
            catch (ex) {
                notification.error({
                    message: `问答 ${n + 1} 上传失败`,
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
        setLoading(false);

        props.onOk();
    }

    return <Modal
        title='导入PDF'
        confirmLoading={loading}
        open={props.open}
        onCancel={props.onCancel}
        onOk={onCommit}
        width={1000}
    >
        <div className='bg-slate-100 p-2 rounded-md'>
            <div className='flex mb-4 w-full'>
                <div className='flex w-96'>
                    <Input
                        placeholder='请选择文件'
                        value={file?.name}
                        disabled
                    />
                    <Upload
                        beforeUpload={(file) => {
                            setFile(file);
                            handleUpload(file);
                            return false;
                        }}
                        maxCount={1}
                        onRemove={() => false}
                        fileList={[]}
                    >
                        <Button icon={<UploadOutlined />}>选择文件</Button>
                    </Upload>
                </div>
                <div className='flex-grow'></div>
            </div>
            <div className='flex flex-col gap-8'>
                {
                    qas.length == 0 &&
                    <Empty />
                }
                {
                    qas.map((qa, index) => {
                        return <Card
                            key={index}
                            title={<div className='flex'>
                                <div>问答 {index + 1}</div>
                                <div className='flex-grow'></div>
                                <Button danger type='text' icon={<DeleteOutlined />}
                                    onClick={() => {
                                        let newqas = [...qas];
                                        newqas.splice(index, 1);
                                        setQas(newqas);
                                    }}
                                ></Button>
                            </div>}
                        >
                            <div key={index} className='flex flex-col gap-4'>
                                <Input
                                    placeholder='请输入标题'
                                    className={qa.question?.length > questionMaxLength ? 'border-red-600 shadow-sm shadow-red-300' : undefined}
                                    maxLength={questionMaxLength}
                                    showCount
                                    value={qa.question}
                                    onChange={(e) => {
                                        qa.question = e.currentTarget.value;
                                        setQas([...qas]);
                                    }}
                                />
                                <Input.TextArea
                                    placeholder='请输入描述'
                                    className={qa.answer?.length > answerMaxLength ? 'border-red-600 shadow-sm shadow-red-300' : undefined}
                                    maxLength={answerMaxLength}
                                    showCount
                                    rows={3}
                                    value={qa.answer}
                                    onChange={(e) => {
                                        qa.answer = e.currentTarget.value;
                                        setQas([...qas]);
                                    }}
                                />
                                <Input
                                    className='mt-4'
                                    placeholder='请输入附加连接'
                                    maxLength={consts.MediumTextLength}
                                    showCount
                                    value={qa.href}
                                    onChange={(e) => {
                                        qa.href = e.currentTarget.value;
                                        setQas([...qas]);
                                    }}
                                />
                            </div>
                        </Card>
                    })
                }
            </div>
        </div>
    </Modal>
}