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
        var result = await iceFetch<{ orderNumber: string, type: 'IN' | 'OUT' } | null>('/api/wms/other/search-order', {
            urlParams: {
                orderNumber: orderNumber
            }
        });
        setLoading(false);

        if (!result) {
            message.error('订单不存在');
            return;
        }

        if (result.type === 'IN') {
            nav(MenuProvider.getUrl(['outinbound', `inbound`]));
            return;
        }

        if (result.type === 'OUT') {
            nav(MenuProvider.getUrl(['outinbound', `outbound`]));
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