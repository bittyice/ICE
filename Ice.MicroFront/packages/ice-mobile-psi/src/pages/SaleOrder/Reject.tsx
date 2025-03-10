import React from 'react';
import { Input, Modal } from 'antd-mobile';
import { consts, IceStateType, SaleOrderApi, SaleOrderEntity, ProductInfoHelper } from 'ice-core';
import { LabelEX, ModalEx, OpenNewKey } from 'ice-mobile-layout';

type Props = {
    entity: SaleOrderEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void
};

class Page extends React.Component<Props> {
    state = {
        loading: false,
        entity: {
            recvInfo: {},
            details: []
        } as SaleOrderEntity,
        rejectReason: undefined as (string | undefined),
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return SaleOrderApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
            ProductInfoHelper.fetchProducts(e.details!.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        }).catch((ex) => {
        });
    }

    onCommit = async () => {
        this.setState({ loading: true });
        try {
            await SaleOrderApi.reject({
                id: this.props.entity.id!,
                rejectReason: this.state.rejectReason
            });
            this.props.onOk();
        } catch { }
        this.setState({ loading: false });
    }

    render() {
        return <ModalEx
            title={`驳回`}
            open={this.props.open}
            onCancel={this.props.onCancel}
            onOk={this.onCommit}
        >
            <div>
                <div>订单：{this.state.entity?.orderNumber}</div>
                <LabelEX text={'驳回原因'} style={{ width: '100%', alignItems: 'flex-start', marginTop: 10 }}>
                    <Input
                        placeholder='请输入原因'
                        style={{ width: '100%' }}
                        maxLength={consts.MediumTextLength}
                        value={this.state.rejectReason}
                        onChange={e => {
                            this.setState({ rejectReason: e });
                        }}
                    />
                </LabelEX>
            </div>
        </ModalEx>
    }
}

export default OpenNewKey(Page);