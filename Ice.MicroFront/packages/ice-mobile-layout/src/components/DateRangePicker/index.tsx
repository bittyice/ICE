import React, { useState } from 'react';
import { DatePicker, Button } from 'antd-mobile';

type DateType = Date | null | undefined;

export default (props: {
    value: [DateType, DateType],
    onChange: (value: [DateType, DateType]) => void
}) => {
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);
    return <div className='flex items-center'>
        <DatePicker
            visible={showStartDate}
            onClose={() => setShowStartDate(false)}
            value={props.value[0] ? props.value[0] : undefined}
            onConfirm={val => {
                props.onChange([new Date(val.getFullYear(), val.getMonth(), val.getDate()), props.value[1]]);
            }}
        />
        <DatePicker
            visible={showEndDate}
            onClose={() => setShowEndDate(false)}
            value={props.value[1] ? props.value[1] : undefined}
            onConfirm={val => {
                props.onChange([props.value[0], new Date(val.getFullYear(), val.getMonth(), val.getDate(), 23, 59, 59)]);
            }}
        />
        <Button size='small' fill='none'
            onClick={() => {
                setShowStartDate(true);
            }}
        >{props.value[0] ? props.value[0].toLocaleDateString() : '开始时间'}</Button>
        -
        <Button size='small' fill='none'
            onClick={() => {
                setShowEndDate(true);
            }}
        >{props.value[1] ? props.value[1].toLocaleDateString() : '结束时间'}</Button>
    </div>
}