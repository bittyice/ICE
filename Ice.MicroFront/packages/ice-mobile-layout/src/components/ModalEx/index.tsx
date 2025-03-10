import React from 'react';
import { Modal, Toast, Button } from 'antd-mobile';

const ModalEx = (props: {
    title: string,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
    children?: React.ReactNode
}) => {
    return <Modal
        visible={props.open}
        content={<div>
            <div className='text-2xl font-semibold'>{props.title}</div>
            <div className='mt-4'>
                {props.children}
            </div>
            <div className='mt-4 flex'>
                <Button onClick={props.onCancel} block>取消</Button>
                <Button onClick={props.onOk} block color='primary'>确认</Button>
            </div>
        </div>}
    />
}

export default ModalEx;