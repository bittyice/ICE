import React, { useEffect, useState } from 'react';
import { svgs, IceStateType, configuration, LabelValues } from 'ice-core';
import Icon, { UserSwitchOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { Divider, Button, Progress } from 'antd';
import { useNavigate } from 'react-router';
import { MenuProvider } from 'ice-layout';
import { useDispatch, useSelector } from 'react-redux';
import { iceFetch } from 'ice-common';
import { Column, Pie, Bar } from '@ant-design/plots';

type ClientStatistics = {
    toDayQuantity: number,
    totalQuantity: number,
    intentionQuantity: Array<{ intention: string, quantity: number }>
}

type QuestionnaireResultStatistics = {
    toDayQuantity: number,
    totalQuantity: number,
}

export default () => {
    const [clientStatistics, setClientStatistics] = useState<ClientStatistics>({
        toDayQuantity: 0,
        totalQuantity: 0,
        intentionQuantity: []
    });
    const [questionnaireResultStatistics, setQuestionnaireResultStatistics] = useState<QuestionnaireResultStatistics>({
        toDayQuantity: 0,
        totalQuantity: 0,
    });

    const nav = useNavigate();
    const tenant = useSelector((state: IceStateType) => state.global.tenant);

    const fetchDats = async () => {
        let clientdata = await iceFetch<ClientStatistics>('/api/ai/kanban/client-statistics');
        setClientStatistics(clientdata);
        let questionnaireResultData = await iceFetch<QuestionnaireResultStatistics>('/api/ai/kanban/questionnaire-result-statistics');
        setQuestionnaireResultStatistics(questionnaireResultData);
    }

    useEffect(() => {
        fetchDats();
    }, []);

    return <div className='flex gap-4'>
        <div className='w-1/2'>
            <div className='flex gap-4'>
                <div className='flex flex-col gap-6 w-1/2 p-4 bg-white rounded'>
                    <div className='font-semibold text-lg flex justify-between'>
                        <span>客户总量</span>
                        <AppstoreAddOutlined />
                    </div>
                    <div className='font-semibold text-blue-600' style={{ fontSize: 40 }}>{clientStatistics.totalQuantity}</div>
                    <div>
                        <span>今日</span>
                        <span className='font-semibold text-3xl text-blue-600 ml-2'>+{clientStatistics.toDayQuantity}</span>
                    </div>
                </div>
                <div className='relative flex flex-col gap-6 w-1/2 p-4 bg-white rounded'>
                    <div className='font-semibold text-lg flex justify-between'>
                        <span>总聊天人次</span>
                        <AppstoreAddOutlined />
                    </div>
                    <div className='font-semibold text-green-600' style={{ fontSize: 40 }}>{questionnaireResultStatistics.totalQuantity}</div>
                    <div>
                        <span>今日</span>
                        <span className='font-semibold text-3xl text-green-600 ml-2'>+{questionnaireResultStatistics.toDayQuantity}</span>
                    </div>
                    <div className='absolute bottom-4 right-4'>
                        <Progress type="circle" percent={100} size={40} />
                    </div>
                </div>
            </div>
            <div className='bg-white rounded mt-4'>
                <Pie
                    height={400}
                    appendPadding={10}
                    data={clientStatistics.intentionQuantity.map(item => ({
                        quantity: item.quantity,
                        intention: LabelValues.ClientIntentionType.find(e => e.value === item.intention)?.label
                    }))}
                    angleField='quantity'
                    colorField='intention'
                    radius={0.8}
                    label={{
                        type: 'outer',
                        content: '{name} {percentage}',
                    }}
                    interactions={[
                        {
                            type: 'pie-legend-active',
                        },
                        {
                            type: 'element-active',
                        },
                    ]}
                />
            </div>
        </div>
        <div className='w-1/2'>
            <div className='bg-white rounded-md p-4'>
                <div className='text-xl font-semibold'>快捷导航</div>
                <div className='flex gap-4 mt-4'>
                    <div className='w-32 h-32 bg-blue-500 rounded-md text-white flex flex-col justify-center items-center cursor-pointer'
                        onClick={() => {
                            nav(`${MenuProvider.preRoute}/ai/qa-online`);
                        }}
                    >
                        <Icon className='text-6xl' component={svgs.QA} />
                        <div className='mt-2'>在线问答</div>
                    </div>
                    <div className='w-32 h-32 bg-green-500 rounded-md text-white flex flex-col justify-center items-center cursor-pointer'
                        onClick={() => {
                            window.open(`${configuration.pcRouterPre}/qa-of-guest?guestkey=${tenant.guestKey}`);
                        }}
                    >
                        <UserSwitchOutlined className='text-6xl' />
                        <div className='mt-2'>访客问答页面</div>
                    </div>
                </div>
            </div>
            <div className='bg-white rounded-md p-4 mt-4'>
                <div className='text-xl font-semibold'>QA</div>
                <Divider />
                <div>
                    <div className='font-semibold'>快速开始</div>
                    <div>
                        <div>1、切换到 <Button target='_blank' type='link' href={`${MenuProvider.preRoute}/ai/gpt`}>基本设置</Button> 页面，完成基本的提示设置。</div>
                        <div>2、切换到 <Button target='_blank' type='link' href={`${MenuProvider.preRoute}/ai/qa-list`}>问答列表</Button> 页面，添加你的问答，AI会根据你的问答自动回复访客。</div>
                        <div>3、以后每天登录后就直接切换到 <Button type='link' href={`${MenuProvider.preRoute}/ai/qa`}>在线问答</Button> 页面，访客提问的问题和AI的作答都可以在该页面看到。在这里你也可以关闭AI的自动回复，自己回答访客的问题。</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}