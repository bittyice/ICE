import React, { useState } from 'react';
import { Space, Input, Tag } from 'antd';

type Props = {
    style?: React.CSSProperties,
    inputStyle?: React.CSSProperties,
    placeholder?: string,
    value: Array<string>,
    onChange: (arr: Array<string>) => void,
}

export default ({ style, inputStyle, placeholder, value, onChange }: Props) => {
    const [input, setInput] = useState('');

    return <Space size={1} style={{ display: 'flex', flexWrap: 'wrap', width: '100%', ...style }}>
        {
            value.map((item, index) => (<Tag key={`${item}_${index}`} closable onClose={() => {
                let newValue = [...value];
                newValue.splice(index, 1);
                onChange(newValue);
            }}>{item}</Tag>))
        }
        <Input
            key='input'
            style={{ width: 80, ...inputStyle }}
            placeholder='空格结束'
            bordered={false}
            value={input}
            onChange={(e) => {
                let input = e.currentTarget.value;
                if(input.endsWith(' ')){
                    let newValue = [...value];
                    newValue.push(input.trim());
                    onChange(newValue);
                    setInput('');
                    return;
                }
                setInput(e.currentTarget.value.trim());
            }}
        />
    </Space>
}