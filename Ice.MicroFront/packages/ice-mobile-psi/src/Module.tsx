import React from 'react';
import { BaseModule, ModuleFactory, PageProvider } from 'icetf';
import { Module as CoreModule, enums, svgs } from 'ice-core';
import { token } from 'ice-common';

import Icon, {
    CarOutlined,
    FileTextOutlined,
    HomeOutlined,
    DashboardOutlined,
    BarsOutlined,
    BarChartOutlined,
    FileSearchOutlined,
    SnippetsOutlined,
    DotChartOutlined,
    MoneyCollectOutlined,
    DropboxOutlined,
    AuditOutlined,
    FileDoneOutlined,
    PieChartOutlined,
    FundOutlined,
    StockOutlined,
    ShopOutlined,
    RadarChartOutlined,
    BookOutlined,
    ApartmentOutlined,
    AppleOutlined,
    WalletOutlined,
    LineChartOutlined,
    AreaChartOutlined,
    FallOutlined,
    RiseOutlined,
    HeatMapOutlined,
    SlidersOutlined,
    SnippetsFilled
} from '@ant-design/icons';
import { MenuProvider } from 'ice-mobile-layout';

import Home from './pages/Home';
import Statistics from './pages/Statistics';
import FeeAnalyse from './pages/FeeAnalyse';
import TurnoverQuota from './pages/TurnoverQuota';
import Invoicing from './pages/Invoicing';
import PurchaseFeeInquiry from './pages/PurchaseFeeInquiry';
import PurchaseReturnFeeInquiry from './pages/PurchaseReturnFeeInquiry';
import SaleFeeInquiry from './pages/SaleFeeInquiry';
import SaleRuturnFeeInquiry from './pages/SaleRuturnFeeInquiry';
import PurchaseOrder from './pages/PurchaseOrder';
import PurchaseReturnOrder from './pages/PurchaseReturnOrder';
import SaleOrder from './pages/SaleOrder';
import SaleReturnOrder from './pages/SaleReturnOrder';

class Module extends BaseModule {
    initialize() {
        MenuProvider.registerMenuGroup({
            backstage: 'psi',
            icon: <SnippetsFilled />,
            text: '进销存',
            homePath: '/home',
            showMenuTabs: false,
            allow: () => token.userInfo.role == enums.IceRoleTypes.Admin && token.userInfo.scope?.some(e => e == enums.IceResourceScopes.PSIScope) == true
        });

        MenuProvider.registerMenu({
            name: 'home',
            text: '统 计',
            icon: <HomeOutlined />,
            component: Home
        }, 'psi', 0);

        MenuProvider.registerMenu({
            name: 'statistics',
            text: '统 计',
            icon: <HomeOutlined />,
            component: Statistics
        }, 'psi', 1);

        MenuProvider.registerMenu({
            name: 'fee-analyse',
            text: '费 用',
            icon: <RadarChartOutlined />,
            component: FeeAnalyse
        }, 'psi', 2);

        MenuProvider.registerMenu({
            name: 'turnover-statistics',
            text: '营业额',
            icon: <BarChartOutlined />,
            component: TurnoverQuota
        }, 'psi', 4);

        MenuProvider.registerMenu({
            name: 'invoicing',
            text: '进销存',
            icon: <DotChartOutlined />,
            component: Invoicing
        }, 'psi', 6);

        MenuProvider.registerMenu({
            name: 'purchase-fee-inquiry',
            text: '采购费用',
            icon: <LineChartOutlined />,
            component: PurchaseFeeInquiry,
        }, 'psi', 8);

        MenuProvider.registerMenu({
            name: 'purchase-return-fee-inquiry',
            text: '采退费用',
            icon: <DotChartOutlined />,
            component: PurchaseReturnFeeInquiry,
        }, 'psi', 10);

        MenuProvider.registerMenu({
            name: 'sale-fee-inquiry',
            text: '销售费用',
            icon: <HeatMapOutlined />,
            component: SaleFeeInquiry,
        }, 'psi', 12);

        MenuProvider.registerMenu({
            name: 'store-ruturn-fee-inquiry',
            text: '销退费用',
            icon: <SlidersOutlined />,
            component: SaleRuturnFeeInquiry,
        }, 'psi', 14);

        MenuProvider.registerMenu({
            name: 'purchase-order',
            text: '采购订单',
            icon: <AuditOutlined />,
            component: PurchaseOrder,
        }, 'psi', 14);

        MenuProvider.registerMenu({
            name: 'purchase-return-order',
            text: '采购退货',
            icon: <FileDoneOutlined />,
            component: PurchaseReturnOrder,
        }, 'psi', 14);

        MenuProvider.registerMenu({
            name: 'sale-order',
            text: '销售订单',
            icon: <FileDoneOutlined />,
            component: SaleOrder,
        }, 'psi', 14);

        MenuProvider.registerMenu({
            name: 'sale-return-order',
            text: '销售退货',
            icon: <BookOutlined />,
            component: SaleReturnOrder,
        }, 'psi', 14);
    }
}

const module = new Module();
export default module;

ModuleFactory.register(module, [CoreModule]);
