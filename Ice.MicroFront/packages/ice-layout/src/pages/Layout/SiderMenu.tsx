import React from 'react';
import { Menu, Image } from 'antd';
import { useNavigate, useMatches, useLocation } from 'react-router-dom';
import { MenuWithUrl } from 'ice-common';
//@ts-ignore
import logoImg from '../../statics/logo.png';
import MenuProvider from '../../menu/MenuProvider';

type Props = {
};

const SiderMenu = () => {
    const nav = useNavigate();
    const location = useLocation();

    const toAntMenu = (menu: MenuWithUrl, group: boolean) => {
        let antmenu: any = {
            label: menu.text,
            key: menu.name,
            icon: menu.icon,
        }

        if (!menu.menuItems) {
            antmenu.onClick = () => {
                nav(menu.url)
            }
            return antmenu;
        }

        if (group) {
            antmenu.type = 'group'
        }

        let antchildmenus: Array<any> = [];
        for (let item of menu.menuItems) {
            if (item.hidden == true) {
                continue;
            }

            if (item.allowAccess && !item.allowAccess()) {
                continue;
            }

            antchildmenus.push(toAntMenu(item, true));
        }
        antmenu.children = antchildmenus;
        return antmenu;
    }

    const curMenuGroupInfo = MenuProvider.getCurMenuGroupInfo()!;
    const antMenus = MenuProvider.getMenus().map(item => {
        return toAntMenu(item, false);
    });

    const names = location.pathname.split('/');
    const name = names[names.length - 1];
    return <div className='h-full flex flex-col'>
        <div className={`flex p-4 gap-4 text-white items-center bg-transparent`} >
            <img className='h-12' src={logoImg} />
            <span className='truncate text-xl font-semibold themebg-r'
                style={{
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                }}
            >小冰 SAAS</span>
        </div>
        <Menu key={curMenuGroupInfo.backstage} className='flex-grow flex-shrink ice-scrollbar overflow-y-auto bg-transparent' theme='dark' mode='inline'
            inlineIndent={18}
            defaultOpenKeys={curMenuGroupInfo.defaultOpenNames}
            selectedKeys={[name]}
            items={antMenus}
        >
        </Menu>
    </div>;
}

export default SiderMenu;