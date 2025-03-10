import React, { useEffect, useState } from "react";
import { IceStateType, TenantApi, GptApi, TenantEntity, GptEntity, globalSlice, enums, consts, configuration } from 'ice-core';
import { Button, Typography, Divider, Input, InputNumber, message, Modal, Switch, Image } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { ArrayInput } from "ice-layout";

export default () => {
    const [loading, setLoading] = useState(false);
    const [tenant, setTenant] = useState<TenantEntity>({} as TenantEntity);
    const [gpt, setGpt] = useState<GptEntity>({} as GptEntity);
    const dispatch = useDispatch();

    const init = async () => {
        setLoading(true);
        try {
            let curTenant = await TenantApi.getCurrent();
            let curGpt = await GptApi.get();
            if (curTenant) {
                setTenant(curTenant);
            }
            if (curGpt) {
                setGpt(curGpt);
            }
        }
        catch { }
        setLoading(false);
    }

    useEffect(() => {
        init();
    }, []);

    return <div>
        <div className="flex flex-col p-8 bg-white rounded-md">
            <div className="text-xl font-semibold">基本设置</div>
            <Divider />
            <div>
                <div>问答欢迎提示语</div>
                <Input
                    className="mt-2"
                    placeholder="问答欢迎提示语"
                    showCount
                    maxLength={128}
                    value={gpt.qaWelcomeText}
                    onChange={e => {
                        gpt.qaWelcomeText = e.currentTarget.value;
                        setGpt({ ...gpt });
                    }}
                />
            </div>
            <Divider />
            <div>
                <div>联系方式窗口时间间隔 <span className="text-gray-400 ml-4">-1表示不弹出，0表示只弹出一次，大于0为每间隔多少秒弹出一次</span></div>
                <InputNumber
                    className="mt-2"
                    placeholder="时间间隔"
                    min={-1}
                    precision={0}
                    value={gpt.contactBoxSpanTime}
                    onChange={e => {
                        gpt.contactBoxSpanTime = e!;
                        setGpt({ ...gpt });
                    }}
                />
            </div>
            <Divider />
            <div>
                <div>访客不提问时自动发送的文本</div>
                <div className="flex items-center gap-4 mt-2">
                    <span>发送的问题</span>
                    <Input
                        className="w-2/3"
                        placeholder="示例：你好，有什么问题都可以问我哦"
                        showCount
                        maxLength={consts.MinTextLength}
                        value={gpt.clientNoResponseText}
                        onChange={e => {
                            gpt.clientNoResponseText = e.currentTarget.value;
                            setGpt({ ...gpt });
                        }}
                    />
                    <span>，多少秒后发送</span>
                    <InputNumber
                        placeholder="如果访客不提问，多少秒后发送该消息，空表示不发送"
                        min={0}
                        precision={0}
                        value={gpt.clientNoResponseTime}
                        onChange={e => {
                            gpt.clientNoResponseTime = e!;
                            setGpt({ ...gpt });
                        }}
                    />
                </div>
            </div>
            <Divider />
            <div>
                <div>引导问题<span className="text-gray-400 ml-4">访客打开聊天窗口时弹出的问题选项，点击即可快速提问</span></div>
                <div className="mt-2">
                    <ArrayInput
                        placeholder='引导问题'
                        inputStyle={{ width: 200 }}
                        value={gpt.clientGuideQuestionText ? gpt.clientGuideQuestionText.split(' ') : []}
                        onChange={(arr) => {
                            gpt.clientGuideQuestionText = arr.join(' ');
                            setGpt({ ...gpt });
                        }}
                    />
                </div>
            </div>
            <Divider />
            <div>
                <div>访客AI回复次数限制<span className="text-gray-400 ml-4">限制AI每天自动回复每个访客的次数，示例：20，则AI回复20次之后便不再回复该访客的消息</span></div>
                <div className="mt-2">
                    <InputNumber
                        className="mt-2"
                        placeholder="AI回复限制"
                        precision={0}
                        value={gpt.aiResponeCount}
                        onChange={e => {
                            gpt.aiResponeCount = e!;
                            setGpt({ ...gpt });
                        }}
                    />
                </div>
            </div>
            <Divider />
            <div>
                <Button loading={loading} type='primary' onClick={async () => {
                    setLoading(true);
                    try {
                        await GptApi.post(gpt);
                        await dispatch(globalSlice.asyncActions.fetchGpt({}) as any);
                        message.success('保存成功');
                    }
                    catch { }
                    setLoading(false);
                }}>保存设置</Button>
            </div>
        </div>
        <div className="flex flex-col p-8 gap-4 bg-white mt-4 rounded-md">
            <div className="text-xl font-semibold">访客密钥</div>
            <div className="text-amber-600">请妥善保管好你的密钥，该密钥目前用于AI客服，请不要泄漏给其他人</div>
            <div>
                <span>访客密钥：</span>
                <span>{tenant.guestKey}</span>
                <Button className="ml-4" type='primary' size='small' disabled={!tenant.guestKey} target="_blank" href={`${configuration.pcRouterPre}/qa-of-guest?guestkey=${tenant.guestKey}`}>打开问答窗口</Button>
            </div>
        </div>
    </div>
}