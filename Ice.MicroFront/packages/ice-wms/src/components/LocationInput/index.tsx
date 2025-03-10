import React, { useEffect, useState } from 'react';
import { Input, AutoComplete, Tag } from 'antd';
import { consts, IceStateType, LocationApi, LocationEntity, locationSlice } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';

type Props = {
    value: string,
    onChange: (val: string) => void,
    iref?: (r: any) => void,
    style?: React.CSSProperties,
    placeholder?: string,
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
    addonBefore?: string,
    disabled?: boolean,
}

const LocationInput = (props: {
    locations: Array<any>,
} & Props) => {
    return <Input.Group compact style={{ display: 'flex', ...props.style }}>
        {props.addonBefore ? <Tag style={{ lineHeight: '26px' }}>{props.addonBefore}</Tag> : undefined}
        <AutoComplete
            style={{ flexGrow: 1 }}
            ref={props.iref}
            placeholder={props.placeholder}
            maxLength={consts.MinTextLength}
            options={props.locations.map(e => ({ value: e.code }))}
            value={props.value}
            onChange={props.onChange}
            onKeyDown={props.onKeyDown}
            disabled={props.disabled}
        />
    </Input.Group>
}

export default (props: Props) => {
    const [locations, setLocatioins] = useState<Array<LocationEntity>>([]);
    const dispatch = useDispatch();
    const fetchDatas = async () => {
        var res = await LocationApi.getList(1, 200, { often: true });
        setLocatioins(res.datas);
    }

    useEffect(() => {
        fetchDatas();
    }, []);

    return <LocationInput
        {...props}
        locations={locations}
    />
};