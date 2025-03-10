import React from 'react';
import { OpenServiceEntity, OpenServiceApi, AllowOpenServiceType, globalSlice, IceStateType, TenantEntity } from 'ice-core';
import { Badge, Card, Tag, Button, Modal, notification, message, List } from 'antd';
import { MenuProvider } from 'ice-layout';
import { Tool, iceFetch, token } from 'ice-common';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

const ServiceName = {
    AI: 'AI问答/客服',
    PSI: '进销存',
    WMS: '仓库管理'
}

const ServiceDescription = {
    AI: '用于AI客服，AI问答等，可以放置在官网或者公众号或者内部管理系统。',
    PSI: '物品的进货，销售，库存管理等，同时也包含记账，打单等。',
    WMS: '仓库管理系统，包含仓库、库位、库存的管理，具有PDA APP。'
}

const Feature: {[k in string]: Array<string>} = {
    AI: ['登录无限制', '功能无限制', '含手机端', '每天 100条 AI自动回复，超出后 0.06￥ / 条'],
    PSI: ['登录无限制', '功能无限制', '含手机端'],
    WMS: ['登录无限制', '功能无限制', '含PDA程序', '快递面单额外收费 0.05￥ / 条']
}

const Item = (props: {
    allowOpenService: AllowOpenServiceType,
    tenantOpenServices: OpenServiceEntity | undefined,
    extendDueDate: () => void,
}) => {
    let isexpire = true;
    if (props.tenantOpenServices?.expireDate && new Date(props.tenantOpenServices.expireDate) > new Date()) {
        isexpire = false;
    }

    return <div className='w-96'>
        <Badge.Ribbon text={isexpire ? '已过期' : '生效中'} color={isexpire ? 'red' : 'green'}>
            <Card title={ServiceName[props.allowOpenService.name]}>
                <div className='flex flex-col gap-4'>
                    <div className='text-green-500'>{ServiceDescription[props.allowOpenService.name]}</div>
                    <div>首次开通时间：{Tool.dateFormat(props.tenantOpenServices?.openDate || null)}</div>
                    <div>到期时间：{Tool.dateFormat(props.tenantOpenServices?.expireDate || null)}</div>
                    <div className='flex justify-end items-center'>
                        <Tag className='p-1 pl-4 pr-4' color="#4096ff">续期费用：{props.allowOpenService.fee} ￥ / {props.allowOpenService.daynum}天</Tag>
                        <Button type='primary' onClick={props.extendDueDate}>续期</Button>
                    </div>
                </div>
                <List
                    className='mt-4'
                    bordered
                    header='功能'
                >
                    {
                        Feature[props.allowOpenService.name].map(item => <List.Item>{item}</List.Item>)
                    }
                </List>
            </Card>
        </Badge.Ribbon>
    </div>
}

class OpenService extends React.Component<{
    navigate: (url: string) => void,
    tenant: TenantEntity,
    refreshPage: () => void
}> {
    state = {
        allowOpenServices: [] as Array<AllowOpenServiceType>,
        tenantOpenServices: [] as Array<OpenServiceEntity>,
    };

    componentDidMount(): void {
        this.init();
    }

    init = async () => {
        let allowOpenServices = await OpenServiceApi.GetSystemOpenServices();
        let tenantOpenServices = await OpenServiceApi.GetOpenServices();
        this.setState({
            allowOpenServices,
            tenantOpenServices
        });
    }

    extendDueDate = async (allowOpenService: AllowOpenServiceType) => {
        await OpenServiceApi.ExtendOpenServiceDueDate({ key: allowOpenService.key });
        notification.success({
            message: '续期成功',
            description: `你已成功续期 ${ServiceName[allowOpenService.name]} ${allowOpenService.daynum}天`,
            duration: null
        });

        // let tenantOpenServices = await OpenServiceApi.GetOpenServices();
        // this.setState({
        //     tenantOpenServices
        // });

        // 重新请求 token
        let accessToken = await iceFetch<string>('/api/auth/Account/recreate-access-token', {
            method: 'POST'
        });
        token.setToken(accessToken);
        this.props.refreshPage();
    }

    render(): React.ReactNode {
        return <div className='flex flex-wrap gap-4'>
            {
                this.state.allowOpenServices.map(allowOpenService => {
                    let tenantOpenService = this.state.tenantOpenServices.find(e => e.name == allowOpenService.name);
                    return <Item
                        allowOpenService={allowOpenService}
                        tenantOpenServices={tenantOpenService}
                        extendDueDate={() => {
                            // 判断余额
                            if (this.props.tenant.amount < allowOpenService.fee) {
                                notification.warning({
                                    message: `余额不足！`,
                                    description: <div>
                                        <span>当前账号余额不足，请先进行充值</span>
                                        <Button type='link' onClick={() => {
                                            this.props.navigate(`${MenuProvider.preRoute}/admin/recharge?amount=${allowOpenService.fee - this.props.tenant.amount}`);
                                        }}>去充值</Button>
                                    </div>,
                                    duration: 15
                                });
                                return;
                            }
                            // 判断是否开通基本服务
                            if (allowOpenService.base) {
                                let base = this.state.tenantOpenServices.find(e => e.name == allowOpenService.base);
                                if (!base || (new Date(base.expireDate!) < new Date())) {
                                    message.warning(`服务"${ServiceName[allowOpenService.name]}"依赖服务"${ServiceName[allowOpenService.base]}"，请先开通"${ServiceName[allowOpenService.base]}"服务。`);
                                    return;
                                }
                            }
                            Modal.confirm({
                                title: `续期 ${ServiceName[allowOpenService.name]} 服务`,
                                content: `你正在续期 ${ServiceName[allowOpenService.name]} ，我们会从你的账号上面扣除 ${allowOpenService.fee} ￥，请确保账号余额充足！`,
                                onOk: () => {
                                    Modal.confirm({
                                        title: `续期 ${ServiceName[allowOpenService.name]} 服务`,
                                        content: `请再次确认你的操作！`,
                                        onOk: () => {
                                            return this.extendDueDate(allowOpenService);
                                        }
                                    })
                                }
                            })
                        }}
                    />
                })
            }
        </div>
    }
}

export default () => {
    const dispatch = useDispatch();
    const tenant = useSelector((state: IceStateType) => state.global.tenant);
    const navigate = useNavigate();
    return <OpenService
        navigate={navigate}
        tenant={tenant}
        refreshPage={() => {
            dispatch(globalSlice.actions.refreshLayout());
        }}
    />
}