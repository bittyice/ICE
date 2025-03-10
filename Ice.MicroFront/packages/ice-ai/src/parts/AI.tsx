import React, { useState } from 'react';
import QAOfGuest from '../pages/QAOfGuest';
import { Button, Popover, Modal } from 'antd';
import Icon from '@ant-design/icons';
import { svgs } from 'ice-core';


export default () => {
    const [show, setShow] = useState(false);

    return <>
        <Button type='primary' onClick={() => setShow(true)}>{<Icon component={svgs.OpenAI} />}</Button>
        {
            show && <Modal
                title='AI助手'
                maskClosable={false}
                open={show}
                onCancel={() => setShow(false)}
                footer={null}
                width={400}
            >
                <div style={{ height: 500 }}>
                    <QAOfGuest guestkey='30fa83ba-89e9-4e88-81a4-d7b74430029a' />
                </div>
            </Modal>
        }
    </>
}