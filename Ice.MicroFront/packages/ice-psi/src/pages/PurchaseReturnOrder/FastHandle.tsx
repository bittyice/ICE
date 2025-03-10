import React from 'react';
import { Modal, Select, Typography, message } from 'antd';
import { LabelEX, OpenNewKey } from 'ice-layout';
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
            message.success('成功');
            this.props.onOk();
        } catch { }
        this.setState({ loading: false });
    }

    render(): React.ReactNode {
        return <Modal
            title='快速处理'
            open={this.props.open}
            onCancel={this.props.onCancel}
            onOk={this.fetchHandle}
            width={350}
        >
            <div>
                <Typography style={{ marginTop: 15 }}>
                    <Typography.Text type='warning'>
                        点击确定后，我们会将订单变更为已完成状态
                    </Typography.Text>
                </Typography>
            </div>
        </Modal>
    }
}

export default OpenNewKey(FastHandle);