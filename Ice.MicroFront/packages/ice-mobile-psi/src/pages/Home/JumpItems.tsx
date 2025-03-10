import React from 'react';
import { Space, List } from 'antd-mobile';
import { ArrowRightOutlined, AppstoreAddOutlined, EllipsisOutlined, MenuOutlined } from '@ant-design/icons';
import { iceFetch } from 'ice-common';
import { useNavigate } from 'react-router';
import { MenuProvider } from 'ice-mobile-layout';

type JumpItemProps = {
    url: string,
    title: string,
    orderQuantity: number,
    color: string
}
const JumpItem = (props: JumpItemProps) => {
    const nav = useNavigate();
    return <List.Item prefix={props.title} onClick={() => {
        nav(props.url);
    }}>
        <div className='flex justify-between'>
            <div>{props.orderQuantity} 单</div>
        </div>
    </List.Item>
}

class JumpItems extends React.Component<{}> {
    state = {
        // 待处理订单数量
        pendingOrderCounts: {
            purchaseCount: 0,
            purchaseReturnCount: 0,
            saleCount: 0,
            saleReturnCount: 0
        }
    }

    componentDidMount() {
        this.fetchPendingOrderCount();
    }

    fetchPendingOrderCount = () => {
        return iceFetch<any>('/api/psi/kanban-home/pending-order-count', {
            method: 'GET'
        }).then(value => {
            this.setState({ pendingOrderCounts: value });
        });
    }

    render(): React.ReactNode {
        return <List>
            <JumpItem color='#b37feb' url={MenuProvider.getUrl(['purchase-order'])} title='采购订单' orderQuantity={this.state.pendingOrderCounts.purchaseCount} />
            <JumpItem color='#722ed1' url={MenuProvider.getUrl(['purchase-return-order'])} title='采购退货' orderQuantity={this.state.pendingOrderCounts.purchaseReturnCount} />
            <JumpItem color='#391085' url={MenuProvider.getUrl(['sale-order'])} title='销售订单' orderQuantity={this.state.pendingOrderCounts.saleCount} />
            <JumpItem color='#120338' url={MenuProvider.getUrl(['sale-return-order'])} title='销售退货' orderQuantity={this.state.pendingOrderCounts.saleReturnCount} />
        </List>
    }
}

export default JumpItems;