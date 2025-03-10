import React, { useState, useRef, useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { iceFetchCallBack } from 'ice-common';

export default () => {
    const [fetchLoading, setFetchLoading] = useState(false);
    const fetchSigns = useRef<Array<number>>([]);

    useEffect(() => {
        // 注册 fetch 回调函数
        const beforefun = (params: {
            input: string,
            init: RequestInit | undefined,
            fetchSign: number
        }) => {
            fetchSigns.current.push(params.fetchSign);
            setFetchLoading(true);
        }

        const afterfun = (params: {
            input: string,
            init: RequestInit | undefined,
            res: any,
            fetchSign: number
        }) => {
            let index = fetchSigns.current.findIndex(e => e == params.fetchSign);
            fetchSigns.current.splice(index, 1);
            if (fetchSigns.current.length == 0) {
                setFetchLoading(false);
            }
        }

        const catchfun = (params: {
            input: string,
            init: RequestInit | undefined,
            ex: any,
            fetchSign: number
        }) => {
            let index = fetchSigns.current.findIndex(e => e == params.fetchSign);
            fetchSigns.current.splice(index, 1);
            if (fetchSigns.current.length == 0) {
                setFetchLoading(false);
            }
        }

        iceFetchCallBack.befores.push(beforefun);
        iceFetchCallBack.afters.push(afterfun);
        iceFetchCallBack.catchs.push(catchfun);

        return () => {
            let beforefunIndex = iceFetchCallBack.befores.findIndex(e => e == beforefun);
            iceFetchCallBack.befores.splice(beforefunIndex, 1);
            let afterfunIndex = iceFetchCallBack.afters.findIndex(e => e == afterfun);
            iceFetchCallBack.afters.splice(afterfunIndex, 1);
            let catchfunIndex = iceFetchCallBack.catchs.findIndex(e => e == catchfun);
            iceFetchCallBack.catchs.splice(catchfunIndex, 1);
        }
    }, []);

    return <Spin size='large' spinning={fetchLoading} indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />;
}