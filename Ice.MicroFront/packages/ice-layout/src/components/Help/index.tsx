import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { QuestionCircleOutlined, InfoOutlined } from '@ant-design/icons';

const Help = (props: {
    title: string,
    body: React.ReactNode,
    children?: React.ReactNode,
}) => {
    const [visible, setVisible] = useState(false);

    return <div style={{ display: 'inline-block' }}>
        {
            props.children ? <span onClick={() => setVisible(true)}>
                {props.children}
            </span>
            : <Button type='link' size='small' icon={<QuestionCircleOutlined />} onClick={() => setVisible(true)}></Button>
        }
        <Modal
            title={props.title}
            open={visible}
            onCancel={() => {
                setVisible(false);
            }}
            footer={null}
        >
            {props.body}
        </Modal>
    </div>
}

export const ButtonHelp = (props: {
    title: string,
    body: React.ReactNode,
}) => <Help {...props}><Button icon={<InfoOutlined />}>帮助文档</Button></Help>

export default Help;