import React, { useEffect, useState } from 'react';
import { Input, Select, InputRef } from 'antd';
import { productInfoSlice, ProductInfoApi, ProductInfoEntity, IceStateType } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';

type Props = {
    value: string,
    style?: React.CSSProperties,
    onChange: (val: string) => void,
    onSelect: (val: string) => void,
    iref?: (r: InputRef) => void,
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
    onBlur?: () => void,
}

const SkuInput = (props: {
    productInfos: Array<any>,
} & Props) => {
    return <div style={{ display: 'flex', alignItems: 'center', width: 300 }}>
        <Input
            ref={props.iref}
            onKeyDown={props.onKeyDown}
            onBlur={props.onBlur}
            style={{ width: 250, ...props.style }}
            placeholder='SKU'
            value={props.value}
            onChange={e => {
                props.onChange(e.currentTarget.value);
            }}
            addonAfter={
                <Select
                    showSearch
                    placeholder='选择产品'
                    style={{ width: 100 }}
                    filterOption={(input, option) => {
                        return ((option?.children as any) ?? '').indexOf(input) >= 0;
                    }}
                    value={props.value || null}
                    onChange={val => {
                        props.onSelect(val);
                    }}
                >
                    {
                        props.productInfos.map(e => <Select.Option value={e.sku}>{e.name}</Select.Option>)
                    }
                </Select>
            }
        />
    </div>
}

export default (props: Props) => {
    const productInfos = useSelector((state: IceStateType) => state.productInfo.allDatas) || [];
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(productInfoSlice.asyncActions.fetchAllDatas({}) as any);
    }, []);

    return <SkuInput
        {...props}
        productInfos={productInfos}
    />
};