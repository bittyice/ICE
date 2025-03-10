import React from 'react';
import './index.css';

// 折角
export default (props: { text?: React.ReactNode, borderWidth?: number, color?: string }) => {
    return <div style={{ borderWidth: props.borderWidth || 30, borderTopColor: props.color, borderRightColor: props.color }} className='dogear'>
        <div className='dogear-text'>{props.text}</div>
    </div>
}