import React, { useEffect, useState } from "react";
import { IceStateType, TenantApi, GptApi, TenantEntity, GptEntity, globalSlice, enums, consts, configuration } from 'ice-core';
import { Button, Typography, Divider, Input, InputNumber, message, Modal, Switch, Image } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { token } from 'ice-common';
// @ts-ignore
import sample1 from './sample1.png';
// @ts-ignore
import sample3 from './sample3.png';

export default () => {
    const [tenant, setTenant] = useState<TenantEntity>({} as TenantEntity);

    const init = async () => {
        try {
            let curTenant = await TenantApi.getCurrent();
            if (curTenant) {
                setTenant(curTenant);
            }
        }
        catch { }
    }

    useEffect(() => {
        init();
    }, []);

    return <div>
        <div className="flex flex-col p-8 bg-white rounded-md">
            <div className="text-xl font-semibold">QA</div>
            <Divider orientationMargin={4} />
            <div className="flex">
                <div className="mr-4">
                    <Image width={200} src={sample1} />
                </div>
                <div>
                    <div className="font-semibold">如何在官网中应用AI客服？</div>
                    <div className="mt-4">
                        <div>请在你的官网中插入如下代码：</div>
                        <code>{`<script id="_ICE_AISCRIPT_" src="https://www.bittyice.cn/pc/ai.js?guestkey=${tenant.guestKey}"></script>`}</code>
                    </div>
                    <div className="mt-4">
                        <div>如果需要默认打开则使用下面的代码（上面的代码不要使用）：</div>
                        <code>{`<script id="_ICE_AISCRIPT_" src="https://www.bittyice.cn/pc/ai.js?guestkey=${tenant.guestKey}&open=1"></script>`}</code>
                    </div>
                </div>
            </div>
            <Divider orientationMargin={4} />
            <div className="flex">
                <div className="mr-4">
                    <Image width={200} src={sample3} />
                </div>
                <div>
                    <div className="font-semibold">如何在公众号应用AI客服？</div>
                    <div className="mt-4">
                        <span>在公众号中添加一个菜单，菜单的href填写如下：</span>
                        <code>{`https://www.bittyice.cn/mb/qa-of-guest?guestkey=${tenant.guestKey}`}</code>
                    </div>
                </div>
            </div>
        </div>
    </div>
}