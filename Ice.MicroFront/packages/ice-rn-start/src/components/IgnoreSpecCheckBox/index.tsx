import React, { useEffect, useState } from 'react';
import { Storage } from 'ice-common';
import { Checkbox } from 'native-base';

export default (props: {
    checked: boolean,
    onChange: (checked: boolean) => void
}) => {
    const IgnoreSpecCheckStorgeName = "_ignorespeccheck_";

    useEffect(() => {
        Storage.getItem(IgnoreSpecCheckStorgeName).then(val => {
            if (val == 'true') {
                props.onChange(true);
            }
        });
    }, []);

    return <Checkbox
        value='enforce'
        isChecked={props.checked}
        onChange={checked => {
            props.onChange(checked);
            Storage.setItem(IgnoreSpecCheckStorgeName, `${checked}`);
        }}
    >忽略规格检查</Checkbox>
}