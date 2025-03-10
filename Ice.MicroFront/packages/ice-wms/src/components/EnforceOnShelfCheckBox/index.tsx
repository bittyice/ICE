import React, { useEffect } from 'react';
import { Checkbox, message } from 'antd';
import { Storage } from 'ice-common';
import { EnforceOnShelfHelp } from '../../components/Helps';

export default (props: {
    checked: boolean,
    onChange: (checked: boolean) => void
}) => {
    const EnforceOnShelfStorgeName = "_enforceonshelf_";

    useEffect(() => {
        Storage.getItem(EnforceOnShelfStorgeName).then(val => {
            if (val == 'true') {
                props.onChange(true);
                message.warning("你已勾选了强制上架");
            }
        });
    }, []);

    return <div>
        <Checkbox
            checked={props.checked}
            onChange={e => {
                props.onChange(e.target.checked);
                Storage.setItem(EnforceOnShelfStorgeName, `${e.target.checked}`);
            }}
        ><span>强制上架</span><EnforceOnShelfHelp /></Checkbox>
    </div>
}