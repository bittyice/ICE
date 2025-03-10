import React, { useEffect } from 'react';
import { Checkbox, message } from 'antd';
import { Storage } from 'ice-common';

export default (props: {
    checked: boolean,
    onChange: (checked: boolean) => void
}) => {
    const IgnoreSpecCheckStorgeName = "_ignorespeccheck_";

    useEffect(() => {
        Storage.getItem(IgnoreSpecCheckStorgeName).then(val => {
            if (val == 'true') {
                props.onChange(true);
                message.warning("你已勾选了忽略规格检查");
            }
        });
    }, []);

    return <div>
        <Checkbox
            checked={props.checked}
            onChange={e => {
                props.onChange(e.target.checked);
                Storage.setItem(IgnoreSpecCheckStorgeName, `${e.target.checked}`);
            }}
        ><span>忽略规格检查</span></Checkbox>
    </div>
}