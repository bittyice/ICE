import React from 'react';
import { PageProvider, Page, BaseModule, ModuleFactory } from 'icetf'
import { Module as CoreModule } from 'ice-core';
import AsyncStorage from '@react-native-community/async-storage';
import { Storage, setDomain, token } from 'ice-common';
import { Navigate } from 'react-router-native';

// 页面
import Layout from './pages/Layout';
import Login from './pages/Login';

// 菜单页
import Home from './pages/Home';
import Setting from './pages/Setting';
import ReceiptList from './pages/Receipt/ReceiptList';
import ReceiptAction from './pages/Receipt/ReceiptAction';
import CheckList from './pages/Check/CheckList';
import CheckAction from './pages/Check/CheckAction';
import OnshelfList from './pages/Onshelf/OnshelfList';
import OnshelfAction from './pages/Onshelf/OnshelfAction';
import PickList from './pages/Pick/PickList';
import PickAction from './pages/Pick/PickAction';
import SortingList from './pages/Sorting/SortingList';
import SortingAction from './pages/Sorting/SortingAction';
import ReviewList from './pages/Review/ReviewList';
import ReviewAction from './pages/Review/ReviewAction';
import OnShelfWithNoOrder from './pages/OnShelfWithNoOrder';
import OffShelfWithNoOrder from './pages/OffShelfWithNoOrder';
import WarehouseCheckList from './pages/WarehouseCheck/WarehouseCheckList';
import WarehouseCheckAction from './pages/WarehouseCheck/WarehouseCheckAction';
import InventoryQuery from './pages/InventoryQuery';
import Transfer from './pages/Transfer';
import Product from './pages/Product';
import MenuProvider from './MenuProvider';

class Module extends BaseModule {
    key = 'ice-rn-start';

    preInitialize() {
        Storage.getItem = AsyncStorage.getItem;
        Storage.setItem = AsyncStorage.setItem;
        Storage.removeItem = AsyncStorage.removeItem;

        setDomain("https://www.bittyice.cn");

        // 初始化token
        return token.init();
    }

    initialize() {
        PageProvider.register({
            name: 'Index',
            url: '/',
            element: <Navigate to='/login' replace />
        });
        PageProvider.register({
            name: 'Login',
            url: '/login',
            element: <Login />
        });
        PageProvider.register({
            name: 'Layout',
            url: '/back/*',
            element: <Layout />
        });
        
        MenuProvider.registerMenu({
            name: 'home',
            text: '主页',
            hidden: true,
            icon: null,
            component: Home
        });

        MenuProvider.registerMenu({
            name: 'setting',
            text: '设置',
            hidden: true,
            icon: null,
            component: Setting
        });

        MenuProvider.registerMenu({
            name: 'receipt',
            text: '收货',
            icon: null,
            component: ReceiptList
        });

        MenuProvider.registerMenu({
            name: 'receipt-action',
            text: '收货',
            icon: null,
            component: ReceiptAction
        }, 1);

        MenuProvider.registerMenu({
            name: 'check',
            text: '验货',
            icon: null,
            component: CheckList
        }, 2);

        MenuProvider.registerMenu({
            name: 'check-action',
            text: '验货',
            icon: null,
            component: CheckAction
        }, 2);

        MenuProvider.registerMenu({
            name: 'on-shelf',
            text: '上架',
            icon: null,
            component: OnshelfList
        }, 3);

        MenuProvider.registerMenu({
            name: 'on-shelf-action',
            text: '上架',
            icon: null,
            component: OnshelfAction
        }, 3);

        MenuProvider.registerMenu({
            name: 'picking',
            text: '拣货',
            icon: null,
            component: PickList
        }, 4);

        MenuProvider.registerMenu({
            name: 'pick-action',
            text: '拣货',
            icon: null,
            component: PickAction
        }, 4);

        MenuProvider.registerMenu({
            name: 'sorting',
            text: '分拣',
            icon: null,
            component: SortingList
        }, 5);

        MenuProvider.registerMenu({
            name: 'sorting-action',
            text: '分拣',
            icon: null,
            component: SortingAction
        }, 5);

        MenuProvider.registerMenu({
            name: 'review',
            text: '复核',
            icon: null,
            component: ReviewList
        }, 6);

        MenuProvider.registerMenu({
            name: 'review-action',
            text: '复核',
            icon: null,
            component: ReviewAction
        }, 6);

        MenuProvider.registerMenu({
            name: 'on-shelf-noorder',
            text: '无单上架',
            icon: null,
            component: OnShelfWithNoOrder
        }, 7);

        MenuProvider.registerMenu({
            name: 'off-shelf-noorder',
            text: '无单下架',
            icon: null,
            component: OffShelfWithNoOrder
        }, 8);

        MenuProvider.registerMenu({
            name: 'warehouse-check',
            text: '库存盘点',
            icon: null,
            component: WarehouseCheckList
        }, 9);

        MenuProvider.registerMenu({
            name: 'warehouse-check-action',
            text: '库存盘点',
            icon: null,
            component: WarehouseCheckAction
        }, 9);

        MenuProvider.registerMenu({
            name: 'inventory-query',
            text: '库存查询',
            icon: null,
            component: InventoryQuery
        }, 9);

        MenuProvider.registerMenu({
            name: 'transfer',
            text: '移库操作',
            icon: null,
            component: Transfer
        }, 10);

        MenuProvider.registerMenu({
            name: 'product',
            text: '产品录入',
            icon: null,
            component: Product,
        }, 11);
    }
}

const module = new Module();
export default module;

ModuleFactory.register(module, [
    CoreModule
]);