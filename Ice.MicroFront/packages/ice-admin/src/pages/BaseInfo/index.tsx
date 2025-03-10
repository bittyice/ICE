import React, { useEffect, useState } from "react";
import { IceStateType, TenantApi, GptApi, TenantEntity, GptEntity, globalSlice, CompanyEntity, consts, configuration } from 'ice-core';
import { Button, Typography, Divider, Input, message, Modal, Cascader } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { LabelEX } from "ice-layout";
import { ChinaAreaCodeHelper } from 'ice-core';

export default () => {
    const [loading, setLoading] = useState(false);
    const [tenant, setTenant] = useState<TenantEntity>({} as TenantEntity);
    const [company, setCompany] = useState<CompanyEntity>({} as CompanyEntity);
    const dispatch = useDispatch();

    const init = async () => {
        setLoading(true);
        try {
            let curTenant = await TenantApi.getCurrent();
            if (curTenant) {
                setTenant(curTenant);
            }
            let curCompany = await TenantApi.getCompany();
            if (curCompany) {
                setCompany(curCompany);
            }
        }
        catch { }
        setLoading(false);
    }

    const fetchSetCompany = async () => {
        if (!company.name) {
            message.error('请输入公司名称');
            return;
        }
        await TenantApi.SetCompany(company);
        message.success('更新成功');
        let curCompany = await TenantApi.getCompany();
        if (curCompany) {
            setCompany(curCompany);
        }
    }

    useEffect(() => {
        init();
    }, []);

    return <div>
        <div className="flex flex-col p-8 gap-4 bg-white rounded-md">
            <div className="text-xl font-semibold">公司信息</div>
            <div className="flex flex-col gap-4 w-1/2">
                <LabelEX isMust text={'公司名称'} style={{ width: '100%' }} tagStyle={{ width: 80 }}>
                    <Input
                        placeholder='你公司的名称-示例：百货商行'
                        value={company.name}
                        onChange={(e) => {
                            company.name = e.currentTarget.value;
                            setCompany({ ...company });
                        }}
                    />
                </LabelEX>
                <LabelEX text={'联系人'} style={{ width: '100%' }} tagStyle={{ width: 80 }}>
                    <Input
                        placeholder='联系人'
                        value={company.contact}
                        onChange={(e) => {
                            company.contact = e.currentTarget.value;
                            setCompany({ ...company });
                        }}
                    />
                </LabelEX>
                <LabelEX text={'联系电话'} style={{ width: '100%' }} tagStyle={{ width: 80 }}>
                    <Input
                        placeholder='联系电话'
                        value={company.phone}
                        onChange={(e) => {
                            company.phone = e.currentTarget.value;
                            setCompany({ ...company });
                        }}
                    />
                </LabelEX>
                <LabelEX text={'省/市/区'} style={{ width: '100%' }} tagStyle={{ width: 80 }}>
                    <Cascader
                        placeholder='省/市/区'
                        style={{ width: '100%' }}
                        options={ChinaAreaCodeHelper.areas}
                        fieldNames={{ label: 'name', value: 'name', children: 'children' }}
                        value={[company.province, company.city, company.town].filter(e => e) as Array<string>}
                        onChange={(arr) => {
                            let [province, city, town] = ChinaAreaCodeHelper.getPCAForNames(arr as Array<string>);
                            company.province = province!;
                            company.city = city!;
                            company.town = town!;
                            setCompany({ ...company });
                        }}
                    />
                </LabelEX>
                <LabelEX text={'邮编'} style={{ width: '100%' }} tagStyle={{ width: 80 }}>
                    <Input
                        placeholder='邮编'
                        value={company.postcode}
                        maxLength={consts.MinTextLength}
                        showCount
                        onChange={(e) => {
                            company.postcode = e.currentTarget.value;
                            setCompany({ ...company });
                        }}
                    />
                </LabelEX>
                <LabelEX text={'详细地址'} style={{ width: '100%' }} tagStyle={{ width: 80 }}>
                    <Input
                        placeholder='详细地址'
                        value={company.addressDetail}
                        maxLength={consts.MediumTextLength}
                        onChange={(e) => {
                            company.addressDetail = e.currentTarget.value;
                            setCompany({ ...company });
                        }}
                    />
                </LabelEX>
            </div>
            <div>
                <Button type='primary' onClick={fetchSetCompany}>保存</Button>
            </div>
        </div>
        <div className="flex flex-col p-8 gap-4 bg-white rounded-md mt-4">
            <div className="text-xl font-semibold">访客密钥</div>
            <div className="text-amber-600">请妥善保管好你的密钥，该密钥目前用于AI客服，请不要泄漏给其他人</div>
            <div>
                <span>访客密钥：</span>
                <span>{tenant.guestKey}</span>
                <Button className="ml-4" type='primary' size='small' disabled={!tenant.guestKey} target="_blank" href={`${configuration.pcRouterPre}/qa-of-guest?guestkey=${tenant.guestKey}`}>打开问答窗口</Button>
            </div>
            <div>
                <Button type='primary' onClick={() => {
                    Modal.confirm({
                        title: '重置访客Key',
                        content: '确定重置访客Key，重置后旧的Key将无法使用！！！',
                        onOk: async () => {
                            await TenantApi.ResetGuestKey();
                            let curTenant = await TenantApi.getCurrent();
                            if (curTenant) {
                                setTenant(curTenant);
                            }
                            await dispatch(globalSlice.asyncActions.fetchTenant({}) as any);
                            message.success('重置成功');
                        }
                    });
                }}>重新生成</Button>
            </div>
        </div>
    </div>
}