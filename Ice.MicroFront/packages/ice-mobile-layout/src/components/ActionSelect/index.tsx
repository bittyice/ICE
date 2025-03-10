import React, { useState } from 'react';
import { ActionSheet, Button } from 'antd-mobile';
import type {
    Action,
} from 'antd-mobile/es/components/action-sheet'

export default (props: {
    options: Array<{ label: string, value: string | number }>
    value: string | number,
    onChange: (value: string | number) => void,
}) => {
    const [visible, setVisible] = useState(false);
    const actions: Action[] = props.options.map(item => ({ text: item.label, key: item.value }));
    const curoption = props.options.find(e => e.value === props.value);
    return <>
        <Button size='small' onClick={() => setVisible(true)} fill='none'>{curoption?.label || '请选择'}</Button>
        <ActionSheet
            className='max-h-screen overflow-y-auto'
            visible={visible}
            actions={actions}
            onClose={() => setVisible(false)}
            onAction={(action, index) => {
                props.onChange(action.key);
                setVisible(false);
            }}
        />
    </>
}