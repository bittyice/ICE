import { configureStore } from '@reduxjs/toolkit';

import { reducer as amountAdjustReducer } from './auths/AmountAdjustSlice';
import { reducer as tenantOfHostReducer } from './auths/TenantOfHostSlice';
import { reducer as guestBlacklistReducer } from './auths/GuestBlacklistSlice';

import { reducer as chatReducer } from './ais/ChatSlice';
import { reducer as qaReducer } from './ais/QaSlice';
import { reducer as qaOnlineReducer } from './ais/QaOnlineSlice';
import { reducer as questionnaireReducer } from './ais/QuestionnaireSlice';
import { reducer as qaTagReducer } from './ais/QaTagSlice';
import { reducer as csTextReducer } from './ais/CsTextSlice';
import { reducer as clientReducer } from './ais/ClientSlice';

import { reducer as addressBookReducer } from './psis/AddressBookSlice';
import { reducer as classifyReducer } from './psis/ClassifySlick';
import { reducer as contractReducer } from './psis/ContractSlice';
import { reducer as productInfoReducer } from './psis/ProductInfoSlice';
import { reducer as purchaseOrderReducer } from './psis/PurchaseOrderSlice';
import { reducer as quoteReducer } from './psis/QuoteSlice';
import { reducer as saleOrderReducer } from './psis/SaleOrderSlice';
import { reducer as purchaseReturnOrderReducer } from './psis/PurchaseReturnOrderSlice';
import { reducer as saleReturnOrderReducer } from './psis/SaleReturnOrderSlice';
import { reducer as supplierReducer } from './psis/SupplierSlice';
import { reducer as paymentMethodReducer } from './psis/PaymentMethodSlice';

import { reducer as areaReducer } from './wmses/AreaSlice';
import { reducer as inboundOrderReducer } from './wmses/InboundOrderSlice';
import { reducer as inventoryAlertReducer } from './wmses/InventoryAlertSlice';
import { reducer as locationReducer } from './wmses/LocationSlice';
import { reducer as locationDetailReducer } from './wmses/LocationDetailSilce';
import { reducer as lossReportOrderReducer } from './wmses/LossReportOrderSlice';
import { reducer as outboundOrderReducer } from './wmses/OutboundOrderSlice';
import { reducer as pickListReducer } from './wmses/PickListSlice';
import { reducer as stockChangeLogReducer } from './wmses/StockChangeLogSlice';
import { reducer as transferSkuReducer } from './wmses/TransferSkuSlice';
import { reducer as warehouseCheckReducer } from './wmses/WarehouseCheckSlice';
import { reducer as warehouseMessageReducer } from './wmses/WarehouseMessageSlice';
import { reducer as warehouseReducer } from './wmses/WarehouseSlice';
import { reducer as warehouseTransferReducer } from './wmses/WarehouseTransferSlice';

import { reducer as globalReducer } from './GlobalSlice';
import psiOthers from './psis/Others';
import wmsOthers from './wmses/Others';

const store = configureStore({
    reducer: {
        global: globalReducer,
        // --Auth--
        amountAdjust: amountAdjustReducer,
        tenantOfHost: tenantOfHostReducer,
        guestBlacklist: guestBlacklistReducer,
        // --AI--
        chat: chatReducer,
        qa: qaReducer,
        qaOnline: qaOnlineReducer,
        questionnaire: questionnaireReducer,
        qaTag: qaTagReducer,
        csText: csTextReducer,
        client: clientReducer,
        // --PSI--
        addressBook: addressBookReducer,
        classify: classifyReducer,
        contract: contractReducer,
        productInfo: productInfoReducer,
        purchaseOrder: purchaseOrderReducer,
        quote: quoteReducer,
        saleOrder: saleOrderReducer,
        purchaseReturnOrder: purchaseReturnOrderReducer,
        saleReturnOrder: saleReturnOrderReducer,
        supplier: supplierReducer,
        paymentMethod: paymentMethodReducer,
        purchaseFeeList: psiOthers.purchaseFeeList.reducer,
        purchaseSkuReport: psiOthers.purchaseSkuReport.reducer,
        saleFeeList: psiOthers.saleFeeList.reducer,
        purchaseReturnFeeList: psiOthers.purchaseReturnFeeList.reducer,
        returnSkuReport: psiOthers.returnSkuReport.reducer,
        saleReturnFeeList: psiOthers.saleReturnFeeList.reducer,
        // --WMS--
        area: areaReducer,
        inboundOrder: inboundOrderReducer,
        inventoryAlert: inventoryAlertReducer,
        location: locationReducer,
        locationDetail: locationDetailReducer,
        lossReportOrder: lossReportOrderReducer,
        outboundOrder: outboundOrderReducer,
        pickList: pickListReducer,
        stockChangeLog: stockChangeLogReducer,
        transferSku: transferSkuReducer,
        warehouseCheck: warehouseCheckReducer,
        warehouseMessage: warehouseMessageReducer,
        warehouse: warehouseReducer,
        warehouseTransfer: warehouseTransferReducer,
        stockInquire: wmsOthers.stockInquire.reducer,
        inboundSkuReport: wmsOthers.inboundSkuReport.reducer,
        outboundSkuReport: wmsOthers.outboundSkuReport.reducer,
    }
});

export type IceStateType = ReturnType<(typeof store)['getState']>

export default store;