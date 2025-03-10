import React from 'react';
import { Button, message, notification, Popconfirm } from 'antd';
import { OutboundOrderEntity, Delivery100Api } from 'ice-core';


export default class extends React.Component<{
    selectRows: Array<OutboundOrderEntity>,
    onOk: () => void,
}> {
    state = {
        loading: false
    }

    fetchCancelExpressOrder = async () => {
        if (this.props.selectRows.length === 0) {
            message.warning('请选择订单');
            return;
        }

        if (this.props.selectRows.some((e: any) => !e.expressNumber)) {
            message.warning('只能取消已打印了面单的订单');
            return;
        }

        this.setState({ loading: true });
        for (var item of this.props.selectRows) {
            try {
                await Delivery100Api.cancelExpressOrder(item);
            }
            catch (ex) {
                notification.error({
                    message: `取消 ${item.outboundNumber} 面单失败`,
                    description: ex.responseData?.error?.message,
                    duration: null
                });
            }
        }
        this.setState({ loading: false });
        message.success('成功');
        this.props.onOk();
    }

    render(): React.ReactNode {
        return <Popconfirm
            title='取消面单'
            onConfirm={this.fetchCancelExpressOrder}
        >
            <Button type='link' danger>取消面单</Button>
        </Popconfirm>
    }
}