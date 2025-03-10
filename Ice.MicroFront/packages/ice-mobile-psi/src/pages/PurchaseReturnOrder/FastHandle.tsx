import React from 'react';
import { Modal, Toast } from 'antd-mobile';
import { LabelEX, OpenNewKey, ModalEx } from 'ice-mobile-layout';
import { PurchaseReturnOrderApi } from 'ice-core';

class FastHandle extends React.Component<{
    entity: any,
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
            await PurchaseReturnOrderApi.fastHandle(this.props.entity.id);
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
            <div className='text-yellow-700'>
                点击确定后，我们会将订单变更为已完成状态
            </div>
        </ModalEx>
    }
}

export default OpenNewKey(FastHandle);