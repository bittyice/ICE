import React from 'react';
import { BaseModule, ModuleFactory, PageProvider } from 'icetf';
import { Module as CoreModule, enums, svgs } from 'ice-core';
import {
    Module as LayoutModule,
    MenuProvider,
    AddressBook,
    Classify,
    ProductInfo
} from 'ice-layout';
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
    HddOutlined,
    SnippetsFilled,
    FundProjectionScreenOutlined,
    ForkOutlined
} from '@ant-design/icons';

// 菜单页
import Home from './pages/Home';
import FeeAnalyse from './pages/FeeAnalyse';
import PurchaseOrder from './pages/PurchaseOrder';
import Supplier from './pages/Supplier';
import Quote from './pages/Quote';
import PurchaseReturnOrder from './pages/PurchaseReturnOrder';
import PurchaseFeeInquiry from './pages/PurchaseFeeInquiry';
import PurchaseReturnFeeInquiry from './pages/PurchaseReturnFeeInquiry';
import Contract from './pages/Contract';
import PurchaseSkuAnalyze from './pages/PurchaseSkuAnalyze';
import ReturnSkuAnalyze from './pages/ReturnSkuAnalyze';
import SaleOrder from './pages/SaleOrder';
import SaleReturnOrder from './pages/SaleReturnOrder';
import TurnoverQuota from './pages/TurnoverQuota';
import PurchaseDetailReport from './pages/PurchaseDetailReport';
import SaleReturnDetailReport from './pages/SaleReturnDetailReport';
import SaleDetailReport from './pages/SaleDetailReport';
import SaleFeeInquiry from './pages/SaleFeeInquiry';
import SaleRuturnFeeInquiry from './pages/SaleRuturnFeeInquiry';
import Stock from './pages/Stock';
import Invoicing from './pages/Invoicing';
import PaymentMethod from './pages/PaymentMethod';
import PurchaseReturnDetailReport from './pages/PurchaseReturnDetailReport'

import OrderSearch from './parts/OrderSearch';

class Module extends BaseModule {
    initialize() {
        MenuProvider.registerMenuGroup({
            backstage: 'psi',
            icon: <SnippetsFilled />,
            text: '进销存',
            homePath: '/dashboard/home',
            allow: () => token.userInfo.role == enums.IceRoleTypes.Admin && token.userInfo.scope?.some(e => e == enums.IceResourceScopes.PSIScope) == true,
            defaultOpenNames: ['dashboard', 'system-order', 'baseinfo'],
            part: [
                <OrderSearch />
            ]
        });

        MenuProvider.registerMenu({
            name: 'dashboard',
            text: '仪表',
            icon: <DashboardOutlined />,
            menuItems: [{
                name: 'home',
                text: '统计分析',
                icon: <HomeOutlined />,
                component: Home
            }, {
                name: 'fee-analyse',
                text: '费用分析',
                icon: <FundProjectionScreenOutlined />,
                component: FeeAnalyse
            }]
        }, 'psi', 0);

        MenuProvider.registerMenu({
            name: 'system-order',
            text: '订单',
            icon: <SnippetsOutlined />,
            menuItems: [
                {
                    name: 'purchase-order',
                    text: '采购订单',
                    icon: <AuditOutlined />,
                    component: PurchaseOrder,
                },
                {
                    name: 'purchase-return-order',
                    text: '采购退货',
                    icon: <FileDoneOutlined />,
                    component: PurchaseReturnOrder,
                },
                {
                    name: 'sale-order',
                    text: '销售订单',
                    icon: <FileTextOutlined />,
                    component: SaleOrder,
                },
                {
                    name: 'sale-return-order',
                    text: '销售退货',
                    icon: <BookOutlined />,
                    component: SaleReturnOrder,
                }
            ]
        }, 'psi', 2);

        MenuProvider.registerMenu({
            name: 'baseinfo',
            text: '基本',
            icon: <FileTextOutlined />,
            menuItems: [
                {
                    name: 'supplier',
                    text: '供应商',
                    icon: <DropboxOutlined />,
                    component: Supplier,
                },
                {
                    name: 'contract',
                    text: '合同管理',
                    icon: <AuditOutlined />,
                    component: Contract,
                },
                {
                    name: 'quote',
                    text: '报价管理',
                    icon: <MoneyCollectOutlined />,
                    component: Quote,
                },
                {
                    name: 'product',
                    text: '产品信息',
                    icon: <DropboxOutlined />,
                    component: ProductInfo
                },
                {
                    name: 'stock',
                    text: '产品库存',
                    icon: <HddOutlined />,
                    component: Stock
                },
                {
                    name: 'classify',
                    text: '产品分类',
                    icon: <ApartmentOutlined />,
                    component: Classify
                },
                {
                    name: 'address',
                    text: '客户地址',
                    icon: <WalletOutlined />,
                    component: AddressBook
                },
                {
                    name: 'payment-method',
                    text: '付款渠道',
                    icon: <ForkOutlined />,
                    component: PaymentMethod
                }]
        }, 'psi', 3);

        MenuProvider.registerMenu({
            name: 'report',
            text: '报表',
            icon: <BarsOutlined />,
            menuItems: [{
                name: 'turnover-statistics',
                text: '营业额统计',
                icon: <BarChartOutlined />,
                component: TurnoverQuota
            }, {
                name: 'invoicing',
                text: '进销存表',
                icon: <DotChartOutlined />,
                component: Invoicing
            }, {
                name: 'purchase-report',
                text: '采购',
                icon: null,
                menuItems: [{
                    name: 'purchase-fee-inquiry',
                    text: '采购费用',
                    icon: <LineChartOutlined />,
                    component: PurchaseFeeInquiry,
                }, {
                    name: 'purchase-sku-analyze',
                    text: '采购产品',
                    icon: <PieChartOutlined />,
                    component: PurchaseSkuAnalyze,
                }, {
                    name: 'purchase-detail-report',
                    text: '采购明细',
                    icon: <AreaChartOutlined />,
                    component: PurchaseDetailReport,
                }]
            }, {
                name: 'purchase-return-report',
                text: '采退',
                icon: null,
                menuItems: [{
                    name: 'purchase-return-fee-inquiry',
                    text: '采购退货费用',
                    icon: <DotChartOutlined />,
                    component: PurchaseReturnFeeInquiry,
                }, {
                    name: 'purchase-return-sku-analyze',
                    text: '采购退货产品',
                    icon: <FundOutlined />,
                    component: ReturnSkuAnalyze,
                }, {
                    name: 'purchase-return-detail-report',
                    text: '采购退货明细',
                    icon: <RadarChartOutlined />,
                    component: PurchaseReturnDetailReport,
                }]
            }, {
                name: 'sale-report',
                text: '销售',
                icon: null,
                menuItems: [{
                    name: 'sale-fee-inquiry',
                    text: '销售费用',
                    icon: <HeatMapOutlined />,
                    component: SaleFeeInquiry,
                }, {
                    name: 'sale-detail-report',
                    text: '销售明细',
                    icon: <RiseOutlined />,
                    component: SaleDetailReport,
                }]
            }, {
                name: 'sale-return-report',
                text: '销退',
                icon: null,
                menuItems: [{
                    name: 'sale-ruturn-fee-inquiry',
                    text: '销售退货费用',
                    icon: <SlidersOutlined />,
                    component: SaleRuturnFeeInquiry,
                }, {
                    name: 'sale-return-detail-report',
                    text: '销售退货明细',
                    icon: <FallOutlined />,
                    component: SaleReturnDetailReport,
                }]
            }]
        }, 'psi', 4);
    }
}

const module = new Module();
export default module;

ModuleFactory.register(module, [CoreModule, LayoutModule]);
