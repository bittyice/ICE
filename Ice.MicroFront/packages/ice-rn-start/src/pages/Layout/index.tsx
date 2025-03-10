import React from 'react';
import { StyleSheet } from 'react-native';
import { Toast, View, Text, Center } from 'native-base';
import { Storage, iceFetch, iceFetchCallBack, token } from 'ice-common';
import { WarehouseEntity, globalSlice, store, warehouseSlice } from 'ice-core';
import MenuProvider from '../../MenuProvider';
import { Route, Routes } from 'react-router-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';

type Props = {
    navigate: (url: any) => void
};

const storageKey = '_curwarehouse_';

class LayoutEX extends React.Component<Props> {
    state = {
        init: false,
    };
    menus = MenuProvider.menus;

    componentDidMount() {
        iceFetchCallBack.catchs.push(this.catchfun);
        this.initFunc().then(() => {
            this.setState({ init: true });
        });
    }

    componentWillUnmount(): void {
        let index = iceFetchCallBack.catchs.findIndex(e => e == this.catchfun);
        iceFetchCallBack.catchs.splice(index, 1);
    }

    initFunc = async () => {
        await Promise.all([
            store.dispatch(globalSlice.asyncActions.fetchTenant({}) as any),
            store.dispatch(globalSlice.asyncActions.fetchUser({}) as any),
            store.dispatch(warehouseSlice.asyncActions.fetchAllDatas({}))
        ]);

        var warehouses = store.getState().warehouse.allDatas as Array<WarehouseEntity>;
        if (!warehouses || warehouses.length == 0) {
            throw new Error('没有可操作的仓库，请建立仓库后再进入仓库管理系统');
        }

        let warehouseId = await Storage.getItem(storageKey);
        let first = warehouses[0];

        if (!warehouseId) {
            store.dispatch(globalSlice.actions.setWarehouse({ warehouse: first }));
            Storage.setItem(storageKey, first.id!);
            return;
        }

        var warehouse = warehouses.find(e => e.id == warehouseId);
        if (!warehouse) {
            store.dispatch(globalSlice.actions.setWarehouse({ warehouse: first }));
            Storage.setItem(storageKey, first.id!);
            return;
        }

        store.dispatch(globalSlice.actions.setWarehouse({ warehouse: warehouse }));
    }

    createRoutes(menus: Array<any>) {
        return menus.map(menu => {
            if (!menu.menuItems) {
                return <Route key={menu.name} path={menu.name} element={<menu.component />}></Route>
            }

            return <Route key={menu.name} path={menu.name}>
                {
                    this.createRoutes(menu.menuItems)
                }
            </Route>
        })
    }

    // 注册 fetch 回调函数
    catchfun = (params: {
        input: string,
        init: RequestInit | undefined,
        ex: any,
        fetchSign: number
    }) => {
        if (params.ex.status == 401) {
            token.clearToken();
            this.props.navigate(`/login`);
            return;
        }

        let error: string;
        let validationErrors = params.ex.responseData?.error?.validationErrors;
        if (validationErrors) {
            error = validationErrors[0]?.message;
        }
        else {
            error = params.ex.responseData?.error?.message;
        }
        Toast.show({
            title: error
        });
    }

    render() {
        if (this.state.init == false) {
            return <Center flex={1}><Text>加载中...</Text></Center>
        }

        return (
            <Routes>
                {
                    this.createRoutes(this.menus)
                }
            </Routes>
        );
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1
    },
});

export default () => {
    const navigate = useNavigate();
    return <LayoutEX navigate={navigate} />
};