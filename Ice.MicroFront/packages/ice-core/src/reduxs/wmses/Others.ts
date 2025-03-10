import Api from '../../apis/Api';
import { iceCreateSlick } from 'ice-common';

const stockInquireApi = new (class extends Api<any> {
    url = '/api/wms/location-detail/stock-inquire';
});
const stockInquireSlice = iceCreateSlick('stockInquire', stockInquireApi);
const stockInquireActions = stockInquireSlice.actions;
const stockInquireReducer = stockInquireSlice.reducer;

const inboundSkuReportApi = new (class extends Api<any> {
    url = '/api/wms/product-report/inbound-sku-report';
});
const inboundSkuReportSlice = iceCreateSlick('inboundSkuReport', inboundSkuReportApi);
const inboundSkuReportActions = inboundSkuReportSlice.actions;
const inboundSkuReportReducer = inboundSkuReportSlice.reducer;

const outboundSkuReportApi = new (class extends Api<any> {
    url = '/api/wms/product-report/outbound-sku-report';
});
const outboundSkuReportSlice = iceCreateSlick('outboundSkuReport', outboundSkuReportApi);
const outboundSkuReportActions = outboundSkuReportSlice.actions;
const outboundSkuReportReducer = outboundSkuReportSlice.reducer;

export default {
    stockInquire: {
        slice: stockInquireSlice,
        actions: stockInquireActions,
        reducer: stockInquireReducer
    },
    inboundSkuReport: {
        slice: inboundSkuReportSlice,
        actions: inboundSkuReportActions,
        reducer: inboundSkuReportReducer
    },
    outboundSkuReport: {
        slice: outboundSkuReportSlice,
        actions: outboundSkuReportActions,
        reducer: outboundSkuReportReducer
    },
}