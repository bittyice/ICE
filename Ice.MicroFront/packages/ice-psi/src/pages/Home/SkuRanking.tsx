import React, { useEffect, useState } from 'react';
import { CrownOutlined, AlignLeftOutlined } from '@ant-design/icons';
import { iceFetch } from 'ice-common';
import { ProductInfoHelper } from 'ice-core';

const Item = (props: {
    index: number,
    name: string,
    quantity: number
}) => {
    return <div className={`flex gap-2 pt-1 pb-1 pr-4 pl-4 rounded ${props.index === 1 ? 'text-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white pt-2 pb-2' : props.index === 2 ? 'text-lg' : props.index === 2 ? 'text-lg' : ''}`}>
        <CrownOutlined />
        <span>{props.index}</span>
        <span>{props.name}</span>
        <div className='grow' />
        <span>{props.quantity} 件</span>
    </div>
}

type DataType = { sku: string, quantity: number }

const SkuRanking = (props: {
}) => {
    const [datas, setDatas] = useState<Array<DataType>>([]);

    const fetchDatas = async () => {
        let datas = await iceFetch<Array<DataType>>('/api/psi/kanban-home/sku-ranking');
        await ProductInfoHelper.fetchProducts(datas.map(e => e.sku));
        setDatas(datas);
    }

    useEffect(() => {
        fetchDatas();
    }, []);

    let items: Array<React.ReactNode> = [];
    for (let n = 0; n < 8; n++) {
        items.push(<Item index={n + 1} name={ProductInfoHelper.skuToProducts[datas[n]?.sku]?.name || '--'} quantity={datas[n]?.quantity || 0} />);
    }

    return <div className='p-4 bg-white rounded-md shadow'>
        <div className=' text-xl font-semibold'>
            <AlignLeftOutlined />
            <span className='ml-2'> 销售产品排名</span>
        </div>
        <div className='flex flex-col gap-4 mt-4'>
            {items}
        </div>
        <div className='text-sm mt-4 text-slate-400'>
            统计过去一个月的出库数量
        </div>
    </div>
}

export default SkuRanking;