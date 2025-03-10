import React, { useState } from 'react';
import { Button, Divider, message, Input, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { iceFetch } from 'ice-common';
import { useNavigate } from 'react-router';
import { MenuProvider } from 'ice-layout';

export default () => {
    const [loading, setLoading] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const nav = useNavigate();

    const fetchSearOrder = async () => {
        if (!orderNumber) {
            message.error('请输入订单号');
            return;
        }

        setLoading(true);
        var result = await iceFetch<{ orderNumber: string, type: 'P' | 'PR' | 'S' | 'SR' } | null>('/api/psi/other/search-order', {
            urlParams: {
                orderNumber: orderNumber
            }
        });
        setLoading(false);

        if (!result) {
            message.error('订单不存在');
            return;
        }

        if (result.type === 'P') {
            nav(MenuProvider.getUrl(['system-order', `purchase-order`]));
            return;
        }

        if (result.type === 'PR') {
            nav(MenuProvider.getUrl(['system-order', `purchase-return-order`]));
            return;
        }

        if (result.type === 'S') {
            nav(MenuProvider.getUrl(['system-order', `sale-order`]));
            return;
        }

        if (result.type === 'SR') {
            nav(MenuProvider.getUrl(['system-order', `sale-return-order`]));
            return;
        }
    }

    return <div>
        <Input
            size='large'
            className='layout-h-order-search-box'
            style={{ width: 250, fontSize: 13 }}
            prefix={<SearchOutlined className='mr-4' />}
            suffix={<Spin spinning={loading} />}
            bordered={false}
            placeholder='订单搜索'
            value={orderNumber}
            onChange={e => setOrderNumber(e.currentTarget.value)}
            onKeyDown={(event) => {
                if (event.code == 'Enter') {
                    fetchSearOrder();
                }
            }}
        />
    </div>
}