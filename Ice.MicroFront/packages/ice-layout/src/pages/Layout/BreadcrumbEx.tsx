import React from 'react';
import MenuProvider from "../../menu/MenuProvider";
import { useLocation } from 'react-router';
import { Breadcrumb, Button } from 'antd';

export default () => {
    let location = useLocation();
    let menus = MenuProvider.urlToMenus(location.pathname);
    return <div className='p-2 pl-5 rounded-md flex items-center'>
        <Breadcrumb
            items={[
                {
                    title: 'ICE'
                },
                ...menus.map(e => ({
                    title: <div style={{ display: 'flex', gap: 6 }}>
                        {e.icon}
                        {e.text}
                    </div>,
                }))
            ]}
        />
        <div style={{ flexGrow: 1 }}></div>
        <div className='flex gap-4 pr-4'>
            <a className='' target='_blank' href="">文档</a>
        </div>
    </div>
}