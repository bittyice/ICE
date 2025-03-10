import React from 'react';
import { Modal, Toast, Button } from 'antd-mobile';
import { PurchaseOrderApi } from 'ice-core';
import { LabelEX, ModalEx, OpenNewKey } from 'ice-mobile-layout';

class FastHandle extends React.Component<{
    order: any,
    open: boolean,
    onCancel: () => void,
    onOk: () => void
}> {
    state = {
        loading: false
    };

    fetchHandle = async () => {
        this.setState({ loading: true });
        try {
            await PurchaseOrderApi.fastHandle(this.props.order.id);
            Toast.show('成功');
            this.props.onOk();
        }
        catch { }
        this.setState({ loading: false });
    }

    render(): React.ReactNode {
        return <ModalEx
            title='快速处理'
            open={this.props.open}
            onCancel={this.props.onCancel}
            onOk={this.fetchHandle}
        >
            <div className='text-yellow-700'>
                点击确定后，我们会将订单变更为已完成状态。
            </div>
        </ModalEx>
    }
}

export default OpenNewKey(FastHandle)