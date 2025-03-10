import React from 'react';
import { BaseModule, ModuleFactory, PageProvider } from 'icetf';
import { Module as CoreModule, enums, svgs } from 'ice-core';
import {
    Module as LayoutModule,
    MenuProvider,
    Classify,
    ProductInfo,
    AddressBook
} from 'ice-layout';
import { token } from 'ice-common';

import {
    FileTextOutlined,
    SwapOutlined,
    SwapLeftOutlined,
    SwapRightOutlined,
    SnippetsOutlined,
    FileSearchOutlined,
    DropboxOutlined,
    SettingOutlined,
    SearchOutlined,
    BranchesOutlined,
    HomeOutlined,
    WarningOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    FormOutlined,
    FieldTimeOutlined,
    CloudServerOutlined,
    DashboardOutlined,
    AppleOutlined,
    WalletOutlined,
    ExceptionOutlined,
    ApartmentOutlined,
    DotChartOutlined,
    BarChartOutlined,
    PieChartOutlined,
    AreaChartOutlined,
    TwitterOutlined,
    ShopOutlined,
    RetweetOutlined,
    HomeFilled,
    MessageOutlined,
    FundOutlined,
    StockOutlined,
    BankOutlined
} from '@ant-design/icons';

// 页面
import Home from './pages/Home';
import InventoryAnalysis from './pages/InventoryAnalysis';
import Area from './pages/Area';
import Location from './pages/Location';
import Inbound, { Check, OnShelf } from './pages/Inbound';
import Outbound, { Review } from './pages/Outbound';
import PickList, { Pick, Sorting, Detail as PickListDetail } from './pages/PickList';
import InventoryManage from './pages/InventoryManage';
import OnShelfWithNoOrder from './pages/OnShelfWithNoOrder';
import OffShelfWithNoOrder from './pages/OffShelfWithNoOrder';
import WarehouseTransfer from './pages/WarehouseTransfer';
import WarehouseCheck, { Check as LocationCheck } from './pages/WarehouseCheck';
import InventoryAlert from './pages/InventoryAlert';
import ExpiredProduct from './pages/ExpiredProduct';
import WarehouseMessage from './pages/WarehouseMessage';
import Transfer from './pages/Transfer';
import StockInquire from './pages/StockInquire';
import OutboundSkuAnalyze from './pages/OutboundSkuAnalyze';
import InboundSkuAnalyze from './pages/InboundSkuAnalyze';
import StockTurnover from './pages/StockTurnover';
import StockChange from './pages/StockChange';
import StockChangeLog from './pages/StockChangeLog';
import InboundDetailReport from './pages/InboundDetailReport';
import OutboundDetailReport from './pages/OutboundDetailReport';
import Delivery100 from './pages/Delivery100';

import WarehouseSelect, { InitFunc } from './parts/WarehouseSelect';
import PDAIcon from './parts/PDAIcon';
import OrderSearch from './parts/OrderSearch';

class Module extends BaseModule {
    initialize() {
        MenuProvider.registerMenuGroup({
            backstage: 'wms',
            icon: <BankOutlined />,
            text: '仓库',
            homePath: '/dashboard/home',
            initFun: InitFunc,
            allow: () => token.userInfo.role == enums.IceRoleTypes.Admin && token.userInfo.scope?.some(e => e == enums.IceResourceScopes.WMSScope) == true,
            defaultOpenNames: ['dashboard', 'outinbound', 'warehouseopt', 'baseinfo'],
            part: [
                <OrderSearch />,
                <div className='border-0 border-l border-gray-300 border-solid h-2/4' />,
                <PDAIcon />,
                <WarehouseSelect />,
                <div className='border-0 border-l border-gray-300 border-solid h-2/4' />,
            ],
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
                name: 'inventory-analysis',
                text: '库存分析',
                icon: <DotChartOutlined />,
                component: InventoryAnalysis
            }]
        }, 'wms', 0);

        MenuProvider.registerMenu({
            name: 'outinbound',
            text: '库存',
            icon: <SwapOutlined />,
            menuItems: [{
                name: 'inbound',
                text: '入库管理',
                icon: <SwapLeftOutlined />,
                component: Inbound
            }, {
                name: 'check',
                text: '查验',
                hidden: true,
                icon: null,
                component: Check
            }, {
                name: 'on-shelf',
                text: '上架',
                hidden: true,
                icon: null,
                component: OnShelf
            }, {
                name: 'outbound',
                text: '出库管理',
                icon: <SwapRightOutlined />,
                component: Outbound
            }, {
                name: 'review',
                text: '复核',
                hidden: true,
                icon: null,
                component: Review
            }, {
                name: 'pick-list',
                text: '拣货管理',
                icon: <FileSearchOutlined />,
                component: PickList
            }, {
                name: 'pick-list-detail',
                text: '拣货明细',
                hidden: true,
                icon: null,
                component: PickListDetail
            }, {
                name: 'pick',
                text: '拣货',
                hidden: true,
                icon: null,
                component: Pick
            }, {
                name: 'sorting',
                text: '分拣',
                hidden: true,
                icon: null,
                component: Sorting
            }]
        }, 'wms', 1);

        MenuProvider.registerMenu({
            name: 'warehouseopt',
            text: '仓库',
            icon: <FormOutlined />,
            menuItems: [{
                name: 'warehouse-check',
                text: '盘点库存',
                icon: <FileSearchOutlined />,
                component: WarehouseCheck
            }, {
                name: 'location-check',
                text: '盘点',
                hidden: true,
                icon: null,
                component: LocationCheck,
            }, {
                name: 'warehouse-transfer',
                text: '调拨任务',
                icon: <BranchesOutlined />,
                component: WarehouseTransfer
            }, {
                name: 'on-shelf-noorder',
                text: '无单上架',
                icon: <ArrowUpOutlined />,
                component: OnShelfWithNoOrder
            }, {
                name: 'off-shelf-noorder',
                text: '无单下架',
                icon: <ArrowDownOutlined />,
                component: OffShelfWithNoOrder
            }, {
                name: 'transfer',
                text: '移库操作',
                icon: <SwapOutlined />,
                component: Transfer
            }, {
                name: 'inventory-manage',
                text: '库存管理',
                icon: <SearchOutlined />,
                component: InventoryManage
            }, {
                name: 'stock-inquire',
                text: '库存查询',
                icon: <FileSearchOutlined />,
                component: StockInquire
            }]
        }, 'wms', 2);

        MenuProvider.registerMenu({
            name: 'baseinfo',
            text: '基本',
            icon: <FileTextOutlined />,
            menuItems: [{
                name: 'area',
                text: '库区管理',
                icon: <SnippetsOutlined />,
                component: Area
            }, {
                name: 'location',
                text: '库位信息',
                icon: <SnippetsOutlined />,
                component: Location
            }, {
                name: 'product',
                text: '产品信息',
                icon: <DropboxOutlined />,
                component: ProductInfo
            }, {
                name: 'classify',
                text: '产品分类',
                icon: <ApartmentOutlined />,
                component: Classify
            }, {
                name: 'address',
                text: '地址管理',
                icon: <WalletOutlined />,
                component: AddressBook
            }, {
                name: 'delivery',
                text: '快递服务',
                icon: <TwitterOutlined />,
                component: Delivery100
            }]
        }, 'wms', 3);

        MenuProvider.registerMenu({
            name: 'report',
            text: '报表',
            icon: <BarChartOutlined />,
            menuItems: [{
                name: 'inbound-sku-analyze',
                text: '入库产品',
                icon: <PieChartOutlined />,
                component: InboundSkuAnalyze
            }, {
                name: 'outbound-sku-analyze',
                text: '出库产品',
                icon: <AreaChartOutlined />,
                component: OutboundSkuAnalyze
            }, {
                name: 'inbound-detail-report',
                text: '入库明细',
                icon: <StockOutlined />,
                component: InboundDetailReport,
            }, {
                name: 'outbound-detail-report',
                text: '出库明细',
                icon: <FundOutlined />,
                component: OutboundDetailReport,
            }, {
                name: 'stock-change',
                text: '库存变化',
                icon: <RetweetOutlined />,
                component: StockChange
            }, {
                name: 'stock-turnover',
                text: '库存周转率',
                icon: <DotChartOutlined />,
                component: StockTurnover
            }]
        }, 'wms', 4);

        MenuProvider.registerMenu({
            name: 'other',
            text: '其他',
            icon: <SettingOutlined />,
            menuItems: [{
                name: 'inventory-alert',
                text: '库存预警',
                icon: <WarningOutlined />,
                component: InventoryAlert
            }, {
                name: 'expired-product',
                text: '过期产品',
                icon: <FieldTimeOutlined />,
                component: ExpiredProduct
            }, {
                name: 'stock-change-log',
                text: '库存日志',
                icon: <FieldTimeOutlined />,
                component: StockChangeLog
            }, {
                name: 'warehouse-message',
                text: '仓库消息',
                icon: <MessageOutlined />,
                component: WarehouseMessage
            }]
        }, 'wms', 5);
    }
}

const module = new Module();
export default module;

ModuleFactory.register(module, [CoreModule]);
