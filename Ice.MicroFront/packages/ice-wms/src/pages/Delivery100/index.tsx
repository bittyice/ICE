import React, { useState } from 'react';
import { Tag, Switch, Typography, Modal, Input, Select, message, Popover } from 'antd';
import { CheckOutlined, CheckSquareOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { consts, Delivery100Api, LabelValues } from 'ice-core';
import './index.css';
import { DogEar, LabelEX, OpenNewKey } from 'ice-layout';
import { Tool, iceFetch } from 'ice-common';
import Kuaidi100Config from '../../components/Kuaidi100Config';

const DeliveryItem = (props: {
    code: string,
    name: string,
    isActive: boolean,
    isDefault: boolean,
    delivery: any,
    onActiveChange: () => Promise<any>,
    onSetDefaultClick: () => Promise<any>,
    onClick: () => void,
}) => {
    const [loading, setLoading] = useState(false);
    const isDefault = props.delivery?.isDefault;

    return <div
        className={`delivery-item ${props.delivery ? '' : 'delivery-item-notopen'}`}
        onClick={(e) => {
            props.onClick();
        }}
    >
        <DogEar text={props.delivery ? '已开通' : '未开通'} />
        <Typography.Title level={5}>{props.name}</Typography.Title>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={e => {
            e.stopPropagation();
            return false;
        }}>
            <Switch checkedChildren='已激活' unCheckedChildren='未激活'
                loading={loading}
                disabled={!props.delivery}
                checked={props.delivery?.isActive}
                onClick={() => {
                    setLoading(true);
                    props.onActiveChange().finally(() => {
                        setLoading(false);
                    });
                }}
            ></Switch>
            {
                props.isDefault && <Popover content='设为默认'>
                    <CheckCircleOutlined
                        style={{ color: isDefault ? '#fa541c' : '#3f6600', fontSize: 28 }}
                        onClick={() => {
                            setLoading(true);
                            props.onSetDefaultClick().finally(() => {
                                setLoading(false);
                            });
                        }}
                    />
                </Popover>
            }
        </div>
    </div>
}

const EditDelivery = OpenNewKey((props: {
    deliveryRequired: any,
    data: any,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
}) => {
    const [data, setData] = useState(props.data ? Tool.deepCopy(props.data) : { kuaidicom: props.deliveryRequired.companyCode });
    const [loading, setLoading] = useState(false);

    let deliveryRequired = props.deliveryRequired;

    const submit = () => {
        setLoading(true);
        (props.data ?
            Delivery100Api.updateConfig(data)
            : Delivery100Api.createConfig(data)
        ).then(() => {
            props.onOk();
        }).finally(() => {
            setLoading(false)
        });
    }

    return <Modal
        title='更新'
        width={350}
        confirmLoading={loading}
        open={props.open}
        onCancel={props.onCancel}
        onOk={() => {
            if (!data.payType) {
                message.error('请选择支付类型');
                return;
            }

            if (!data.expType) {
                message.error('请选择业务类型');
                return;
            }

            submit();
        }}
    >
        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
            <LabelEX isMust={deliveryRequired.partnerId} text='账户号码' tagStyle={{ width: 90, textAlign: 'end' }}>
                <Input
                    placeholder={deliveryRequired.partnerId}
                    defaultValue={data.partnerId}
                    maxLength={consts.MinTextLength}
                    onChange={(e) => {
                        data.partnerId = e.currentTarget.value;
                        setData(data);
                    }}
                />
            </LabelEX>
            <LabelEX isMust={deliveryRequired.partnerKey} text='账户密码' tagStyle={{ width: 90, textAlign: 'end' }}>
                <Input
                    placeholder={deliveryRequired.partnerKey}
                    defaultValue={data.partnerKey}
                    maxLength={consts.MinTextLength}
                    onChange={(e) => {
                        data.partnerKey = e.currentTarget.value;
                        setData(data);
                    }}
                />
            </LabelEX>
            <LabelEX isMust={deliveryRequired.partnerSecret} text='密钥' tagStyle={{ width: 90, textAlign: 'end' }}>
                <Input
                    placeholder={deliveryRequired.partnerSecret}
                    defaultValue={data.partnerSecret}
                    maxLength={consts.MinTextLength}
                    onChange={(e) => {
                        data.partnerSecret = e.currentTarget.value;
                        setData(data);
                    }}
                />
            </LabelEX>
            <LabelEX isMust={deliveryRequired.partnerName} text='账户名称' tagStyle={{ width: 90, textAlign: 'end' }}>
                <Input
                    placeholder={deliveryRequired.partnerName}
                    defaultValue={data.partnerName}
                    maxLength={consts.MinTextLength}
                    onChange={(e) => {
                        data.partnerName = e.currentTarget.value;
                        setData(data);
                    }}
                />
            </LabelEX>
            <LabelEX isMust={deliveryRequired.net} text='网点名称' tagStyle={{ width: 90, textAlign: 'end' }}>
                <Input
                    placeholder={deliveryRequired.net}
                    defaultValue={data.net}
                    maxLength={consts.MinTextLength}
                    onChange={(e) => {
                        data.net = e.currentTarget.value;
                        setData(data);
                    }}
                />
            </LabelEX>
            <LabelEX isMust={deliveryRequired.checkMan} text='快递员名' tagStyle={{ width: 90, textAlign: 'end' }}>
                <Input
                    placeholder={deliveryRequired.checkMan}
                    defaultValue={data.checkMan}
                    maxLength={consts.MinTextLength}
                    onChange={(e) => {
                        data.checkMan = e.currentTarget.value;
                        setData(data);
                    }}
                />
            </LabelEX>
            <LabelEX isMust text='支付类型' tagStyle={{ width: 90, textAlign: 'end' }}>
                <Select
                    placeholder='支付类型'
                    style={{ width: '100%' }}
                    defaultValue={data.payType}
                    onChange={(val) => {
                        data.payType = val;
                        setData(data);
                    }}
                >
                    {
                        Kuaidi100Config.Kuaidi100PayType.map(item => <Select.Option value={item.value}>{item.label}</Select.Option>)
                    }
                </Select>
            </LabelEX>
            <LabelEX isMust text='默认业务' tagStyle={{ width: 90, textAlign: 'end' }}>
                <Select
                    placeholder='默认业务'
                    style={{ width: '100%' }}
                    defaultValue={data.expType}
                    onChange={(val) => {
                        data.expType = val;
                        setData(data);
                    }}
                >
                    {
                        (Kuaidi100Config.Kuaidi100ExtType as any)[deliveryRequired.companyCode].map((item: string) => <Select.Option value={item}>{item}</Select.Option>)
                    }
                </Select>
            </LabelEX>
            <Typography.Text type='warning'><span style={{ color: 'red' }}>*</span> 为必填项，如填写不正确会获取不了面单</Typography.Text>
        </div>
    </Modal>
})

class Delivery extends React.Component<{
    deliverys: Array<any>,
    fetchDeliverys: () => Promise<any>
}> {
    state = {
        showEditDelivery: false,
        editDeliveryRequired: null as any,
        editDelivery: null as any
    }

    componentDidMount(): void {
        this.props.fetchDeliverys();
    }

    fetchActive = (row: any) => {
        return Delivery100Api.setActive({
            id: row.id,
            isActive: !row.isActive
        }).then(() => {
            return this.props.fetchDeliverys();
        });
    }

    fetchSetDefault = (row: any) => {
        return Delivery100Api.setDefault(row.id).then(() => {
            return this.props.fetchDeliverys();
        });
    }

    render(): React.ReactNode {
        return <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {
                Kuaidi100Config.Kuaidi100Required.map(item => {
                    let delivery = this.props.deliverys.find(e => e.kuaidicom == item.companyCode);
                    return <DeliveryItem
                        name={item.companyName}
                        code={item.companyCode}
                        isActive={true}
                        isDefault={true}
                        delivery={delivery}
                        onActiveChange={() => {
                            if (!delivery) {
                                return Promise.resolve();
                            }
                            return this.fetchActive(delivery);
                        }}
                        onSetDefaultClick={() => {
                            if (!delivery) {
                                return Promise.resolve();
                            }
                            return this.fetchSetDefault(delivery);
                        }}
                        onClick={() => {
                            this.setState({
                                showEditDelivery: true,
                                editDeliveryRequired: item,
                                editDelivery: delivery
                            });
                        }}
                    />
                })
            }
            {
                this.state.editDeliveryRequired &&
                <EditDelivery
                    open={this.state.showEditDelivery}
                    deliveryRequired={this.state.editDeliveryRequired}
                    data={this.state.editDelivery}
                    onCancel={() => {
                        this.setState({ showEditDelivery: false });
                    }}
                    onOk={() => {
                        this.setState({ showEditDelivery: false });
                        this.props.fetchDeliverys();
                    }}
                />
            }
        </div>
    }
}

export default () => {
    const [deliverys, setDeliverys] = useState<Array<any>>([]);
    const fetchDeliverys = async () => {
        let datas = await Delivery100Api.getAllConfigs();
        setDeliverys(datas);
    }

    return <Delivery deliverys={deliverys} fetchDeliverys={fetchDeliverys} />
}