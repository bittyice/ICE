import React from 'react';
import { Divider, Cascader, Tag, Button, Space, Input, Modal, Toast, Switch } from 'antd-mobile';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, SaleReturnOrderApi, SaleReturnOrderEntity, ProductInfoHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { NumberOutlined } from '@ant-design/icons';
import { ModalEx } from 'ice-mobile-layout';

class FastHandle extends React.Component<{
    entity?: SaleReturnOrderEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void
}> {
    state = {
        loading: false,
        totalPrice: null as (number | null),
    };

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return SaleReturnOrderApi.get(this.props.entity.id).then((e) => {
            let total = 0;
            e.details!.forEach((item: any) => {
                total = total + item.quantity * item.unitPrice;
            });
            this.setState({ totalPrice: total });
        }).catch((ex) => {
        });
    }

    fetchHandle = async () => {
        if (!this.state.totalPrice) {
            Toast.show('请填写退货总价');
            return;
        }

        this.setState({ loading: true });
        try {
            await SaleReturnOrderApi.fastHandle({
                id: this.props.entity?.id!,
                totalPrice: this.state.totalPrice
            });
            Toast.show('成功');
            this.props.onOk();
        } catch { }
        this.setState({ loading: false });
    }

    render(): React.ReactNode {
        return <ModalEx
            title='快速处理'
            open={this.props.open}
            onCancel={this.props.onCancel}
            onOk={this.fetchHandle}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <LabelEX isMust text={'退货总价'} style={{ width: '100%' }} tagStyle={{ width: 90 }}>
                    <Input
                        style={{ width: '100%' }}
                        placeholder='请输入退货总价'
                        value={this.state.totalPrice?.toString()}
                        onChange={val => {
                            let num = parseInt(val);
                            if (isNaN(num)) {
                                this.state.totalPrice = null;
                            }
                            else {
                                this.state.totalPrice = num;
                            }
                            this.setState({});
                        }}
                    />
                </LabelEX>
                <div className='mt-2 text-yellow-700'>点击确定后，我们会将订单变更为已完成状态</div>
            </div>
        </ModalEx>
    }
}

export default OpenNewKey(FastHandle);