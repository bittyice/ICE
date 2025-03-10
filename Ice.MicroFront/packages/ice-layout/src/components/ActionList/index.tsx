import React from 'react';
import { Space, Popover, Button } from 'antd';

export default class extends React.Component<{
    length?: number,
    children: Array<React.ReactNode> | React.ReactNode
}> {
    render() {
        let children;

        if (!(this.props.children instanceof Array)) {
            children = [this.props.children];
        }
        else {
            children = this.props.children;
        }

        let max = this.props.length || 3;
        children = children.filter(e => !!e);

        if (children.length <= max) {
            children = this.props.children;
        }
        else {
            let showList: Array<React.ReactNode> = [];
            let hideList: Array<React.ReactNode> = [];
            for (let i = 0; i < children.length; i++) {
                if (i < max - 1) {
                    showList.push(children[i]);
                }
                else {
                    hideList.push(children[i]);
                }
            }
            children = <>
                {showList}
                <Popover content={<Space size="small" split={<span style={{ color: '#adadad' }}>|</span>}>{hideList}</Space>} title='扩展' trigger="click">
                    <Button size='small' type='link'>...</Button>
                </Popover>
            </>
        }

        return <Space size='small' split={<span style={{ color: '#adadad' }}>|</span>}>
            {children}
        </Space>
    }
}