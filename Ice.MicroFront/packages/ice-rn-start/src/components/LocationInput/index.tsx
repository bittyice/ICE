import React, { useEffect, useState } from 'react';
import { Text, View, Input, Actionsheet, Button } from 'native-base';
import { InputSelect, ItemInputProps } from '../Item';
import { useSelector, useDispatch } from 'react-redux';
import { LocationApi, LocationEntity } from 'ice-core';

type Props = {
    value: string,
    onChange: (value: string) => void,
} & ItemInputProps;

const LocationInput = (props: {
    locations: Array<any>
} & Props) => {
    return <InputSelect
        text={props.text}
        iref={props.iref}
        autoFocus={props.autoFocus}
        onChange={props.onChange}
        value={props.value}
        onSubmitEditing={props.onSubmitEditing}
        onBlur={props.onBlur}
        values={props.locations.map((e) => ({ label: e.code, value: e.code }))}
    />
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