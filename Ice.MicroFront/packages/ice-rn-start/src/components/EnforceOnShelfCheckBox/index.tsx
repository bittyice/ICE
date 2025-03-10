import React, { useEffect, useState } from 'react';
import { Storage } from 'ice-common';
import { Toast, Checkbox } from 'native-base';

export default (props: {
    checked: boolean,
    onChange: (checked: boolean) => void
}) => {
    const EnforceOnShelfStorgeName = "_enforceonshelf_";

    useEffect(() => {
        Storage.getItem(EnforceOnShelfStorgeName).then(val => {
            if (val == 'true') {
                props.onChange(true);
                Toast.show({
                    title: '你已勾选了强制上架'
                });
            }
        });
    }, []);

    return <Checkbox
        value='enforce'
        isChecked={props.checked}
        onChange={checked => {
            props.onChange(checked);
            Storage.setItem(EnforceOnShelfStorgeName, `${checked}`);
        }}
    >强制上架</Checkbox>
}