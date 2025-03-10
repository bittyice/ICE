import React from 'react';
import { Divider, Cascader, Tag, Input, Modal, Switch, Toast } from 'antd-mobile';
import { consts, IceStateType, SaleOrderApi, SaleOrderEntity, ProductInfoHelper } from 'ice-core';
import { LabelEX, ModalEx, OpenNewKey } from 'ice-mobile-layout';

class FastHandle extends React.Component<{
    entity: SaleOrderEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void
}> {
    state = {
        loading: false,
        totalPrice: this.props.entity.placeTotalPrice as (number | null),
    };

    fetchHandle = async () => {
        if (this.state.totalPrice == null || this.state.totalPrice == undefined) {
            Toast.show('请填写应支付总价');
            return;
        }

        this.setState({ loading: true });
        try {
            await SaleOrderApi.fastHandle({
                id: this.props.entity.id!,
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
                <LabelEX isMust text={'应支付总价'} style={{ width: '100%' }} tagStyle={{ width: 120 }}>
                    <Input
                        style={{ width: '100%' }}
                        placeholder='请输入应支付总价'
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
                <div className='mt-2 text-yellow-700'>点击确定后，订单变更为已签收状态</div>
            </div>
        </ModalEx>
    }
}

export default OpenNewKey(FastHandle);