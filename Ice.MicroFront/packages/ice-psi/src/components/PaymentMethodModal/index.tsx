import React, { useState } from 'react';
import { Modal, Select, message } from 'antd';
import { LabelEX, OpenNewKey } from 'ice-layout';
import { PaymentMethodEntity } from 'ice-core';

export default OpenNewKey((props: {
    paymentMethods: Array<PaymentMethodEntity>,
    open: boolean,
    onCancel: () => void,
    onOk: (paymentMethodId: string | null) => void,
}) => {
    const [paymentMethodId, setPaymentMethodId] = useState<string | null | undefined>(undefined);

    return <Modal
        title='设置支付方式'
        open={props.open}
        onCancel={props.onCancel}
        maskClosable={false}
        onOk={() => {
            if (paymentMethodId === undefined) {
                message.error('请选择支付方式');
                return;
            }

            props.onOk(paymentMethodId);
        }}
        width={300}
    >
        <div className='p-4'>
            <LabelEX text='支付方式'>
                <Select
                    placeholder='支付方式'
                    className='w-full'
                    value={paymentMethodId}
                    onChange={e => setPaymentMethodId(e)}
                >
                    <Select.Option value={null}>置空</Select.Option>
                    {
                        props.paymentMethods.map(e => <Select.Option value={e.id!}>{e.name}</Select.Option>)
                    }
                </Select>
            </LabelEX>
        </div>
    </Modal>
})