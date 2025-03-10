import Api from '../../apis/Api';
import { iceCreateSlick } from 'ice-common';

const PurchaseFeeListApi = new (class extends Api<any> {
    url = '/api/psi/fee-inquiry/purchase-fee-list';
});

const purchaseFeeListSlice = iceCreateSlick('purchaseFeeList', PurchaseFeeListApi);
const purchaseFeeListActions = purchaseFeeListSlice.actions;
const purchaseFeeListReducer = purchaseFeeListSlice.reducer;

const PurchaseSkuReportApi = new (class extends Api<any> {
    url = `/api/psi/report/purchase-sku-report`;
});
const purchaseSkuReportSlice = iceCreateSlick('purchaseSkuReport', PurchaseSkuReportApi);
const purchaseSkuReportActions = purchaseSkuReportSlice.actions;
const purchaseSkuReportReducer = purchaseSkuReportSlice.reducer;

const SaleFeeListApi = new (class extends Api<any> {
    url = `/api/psi/fee-inquiry/sale-fee-list`;
});
const saleFeeListSlice = iceCreateSlick('saleFeeList', SaleFeeListApi);
const saleFeeListActions = saleFeeListSlice.actions;
const saleFeeListReducer = saleFeeListSlice.reducer;

const PurchaseReturnFeeListApi = new (class extends Api<any> {
    url = `/api/psi/fee-inquiry/purchase-return-fee-list`;
});
const purchaseReturnFeeListSlice = iceCreateSlick('purchaseReturnFeeList', PurchaseReturnFeeListApi);
const purchaseReturnFeeListActions = purchaseReturnFeeListSlice.actions;
const purchaseReturnFeeListReducer = purchaseReturnFeeListSlice.reducer;

const ReturnSkuReportApi = new (class extends Api<any> {
    url = `/api/psi/report/return-sku-report`;
});
const returnSkuReportSlice = iceCreateSlick('returnSkuReport', ReturnSkuReportApi);
const returnSkuReportActions = returnSkuReportSlice.actions;
const returnSkuReportReducer = returnSkuReportSlice.reducer;

const SaleReturnFeeListApi = new (class extends Api<any> {
    url = `/api/psi/fee-inquiry/sale-return-fee-list`;
});
const saleReturnFeeListSlice = iceCreateSlick('saleReturnFeeList', SaleReturnFeeListApi);
const saleReturnFeeListActions = saleReturnFeeListSlice.actions;
const saleReturnFeeListReducer = saleReturnFeeListSlice.reducer;

export default {
    purchaseFeeList: {
        slice: purchaseFeeListSlice,
        actions: purchaseFeeListActions,
        reducer: purchaseFeeListReducer
    },
    purchaseSkuReport: {
        slice: purchaseSkuReportSlice,
        actions: purchaseSkuReportActions,
        reducer: purchaseSkuReportReducer
    },
    saleFeeList: {
        slice: saleFeeListSlice,
        actions: saleFeeListActions,
        reducer: saleFeeListReducer
    },
    purchaseReturnFeeList: {
        slice: purchaseReturnFeeListSlice,
        actions: purchaseReturnFeeListActions,
        reducer: purchaseReturnFeeListReducer
    },
    returnSkuReport: {
        slice: returnSkuReportSlice,
        actions: returnSkuReportActions,
        reducer: returnSkuReportReducer
    },
    saleReturnFeeList: {
        slice: saleReturnFeeListSlice,
        actions: saleReturnFeeListActions,
        reducer: saleReturnFeeListReducer
    }
}