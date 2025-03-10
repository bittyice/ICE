import React, { useEffect, useState } from 'react';
import { Input, Select, AutoComplete } from 'antd';
import { productInfoSlice, ProductInfoApi, ProductInfoEntity, IceStateType, consts } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';

type Props = {
    disabled?: boolean,
    sku?: string,
    style?: React.CSSProperties,
    onSelect: (product: ProductInfoEntity | null) => void,
}

const SkuInput = (props: {
    productInfos: Array<ProductInfoEntity>,
} & Props) => {
    const [name, setName] = useState<string | undefined>();

    useEffect(() => {
        if (props.sku) {
            let product = props.productInfos.find(e => e.sku === props.sku);
            setName(product?.name);
        }
    }, []);

    return <AutoComplete
        style={props.style}
        disabled={props.disabled}
        placeholder='输入或选择产品'
        bordered={false}
        options={name ?
            props.productInfos.filter(e => e.name && e.name.includes(name)).map(item => ({
                value: item.name,
            }))
            : props.productInfos.map(item => ({
                value: item.name
            }))
        }
        value={name}
        maxLength={consts.MinTextLength}
        onChange={(name) => {
            setName(name);
        }}
        onSelect={(name) => {
            const productInfo = props.productInfos.find(e => e.name === name);
            if (productInfo) {
                props.onSelect(productInfo);
            }
        }}
        onBlur={() => {
            const productInfo = props.productInfos.find(e => e.name === name);
            if (productInfo) {
                props.onSelect(productInfo);
            }
            else {
                props.onSelect(null);
                setName(undefined);
            }
        }}
    />
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