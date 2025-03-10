import React from 'react'
import { Layout, message, Skeleton, notification, Spin } from 'antd';
import { MenuWithUrl } from 'ice-common';
import { Route, Routes } from 'react-router-dom';
import MenuProvider from '../../menu/MenuProvider';

const createComponent = (Child: React.ComponentType) => {
    return class MotionEX extends React.Component<any> {
        state = {
            loading: true
        }

        componentDidMount() {
            setTimeout(() => {
                this.setState({ loading: false });
            }, 100)
        }

        render() {
            return <Spin spinning={this.state.loading} wrapperClassName='layout-pack'>
                <Child {...this.props} />
            </Spin>
        }
    }
}

type Props = {
};

class ContentEX extends React.Component<Props> {
    oldComponent: any = () => <></>;
    menus;

    constructor(props: Props) {
        super(props);

        this.menus = this.packageComponent(MenuProvider.getMenus());
    }

    componentDidMount() {

    }

    packageComponent(menus: Array<MenuWithUrl>): Array<MenuWithUrl> {
        return menus.map(item => {
            return {
                ...item,
                component: item.component ? createComponent(item.component) : item.component,
                menuItems: item.menuItems ? this.packageComponent(item.menuItems) : item.menuItems,
            }
        });
    }

    createRoutes(menus: Array<MenuWithUrl>) {
        return menus.map(menu => {
            if (!menu.menuItems) {
                let Component = menu.component as any;
                return <Route key={menu.name} path={menu.name} element={<Component />}></Route>
            }

            return <Route key={menu.name} path={menu.name}>
                {
                    this.createRoutes(menu.menuItems)
                }
            </Route>
        })
    }

    render() {
        return (
            <Routes>
                {
                    this.createRoutes(this.menus)
                }
            </Routes>
        );
    }
}

export default ContentEX;