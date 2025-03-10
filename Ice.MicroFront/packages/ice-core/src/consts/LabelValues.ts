import enums from './enums';

export default {
    OMSPurchaseOrderStatus: [
        { label: '待审核', value: enums.OMSPurchaseOrderStatus.PendingReview, lang: '', color: '' },
        { label: '采购中', value: enums.OMSPurchaseOrderStatus.Purchasing, lang: '', color: '#faad14' },
        { label: '已完成', value: enums.OMSPurchaseOrderStatus.Completed, lang: '', color: '#13c2c2' },
        { label: '已作废', value: enums.OMSPurchaseOrderStatus.Invalid, lang: '', color: '#f5222d' },
    ],
    OMSPurchaseReturnOrderStatus: [
        { label: '待审核', value: enums.OMSPurchaseReturnOrderStatus.PendingReview, lang: '', color: '' },
        { label: '退货中', value: enums.OMSPurchaseReturnOrderStatus.Returning, lang: '', color: '#faad14' },
        { label: '已完成', value: enums.OMSPurchaseReturnOrderStatus.Completed, lang: '', color: '#13c2c2' },
        { label: '已作废', value: enums.OMSPurchaseReturnOrderStatus.Invalid, lang: '', color: '#f5222d' },
    ],
    STSaleOrderStatus: [
        { label: '待确认', value: enums.STSaleOrderStatus.WaitConfirm, lang: '', color: '' },
        { label: '待处理', value: enums.STSaleOrderStatus.ToBeProcessed, lang: '', color: '#1890ff' },
        { label: '处理中', value: enums.STSaleOrderStatus.Processing, lang: '', color: '#faad14' },
        { label: '已收货', value: enums.STSaleOrderStatus.Completed, lang: '', color: '#13c2c2' },
        { label: '已作废', value: enums.STSaleOrderStatus.Rejected, lang: '', color: '#f5222d' },
    ],
    STSaleOrderReturnStatus: [
        { label: '待确认', value: enums.STSaleOrderReturnStatus.WaitConfirm, lang: '', color: '' },
        { label: '待处理', value: enums.STSaleOrderReturnStatus.ToBeProcessed, lang: '', color: '#1890ff' },
        { label: '退货中', value: enums.STSaleOrderReturnStatus.Returning, lang: '', color: '#faad14' },
        { label: '已完成', value: enums.STSaleOrderReturnStatus.Completed, lang: '', color: '#13c2c2' },
        { label: '已作废', value: enums.STSaleOrderReturnStatus.Rejected, lang: '', color: '#f5222d' },
    ],

    // 通用状态
    ActiveStatus: [
        { label: '启用', value: 'ACTIVE', lang: 'normal' },
        { label: '禁用', value: 'INACTIVE', lang: 'disable' }
    ],
    InboundOrderType: [
        { label: '采购', value: enums.InboundOrderType.Purchase, lang: '', color: '#faad14' },
        { label: '销售退货', value: enums.InboundOrderType.SaleReturn, lang: '', color: '#13c2c2' },
        { label: '调拨', value: enums.InboundOrderType.Transfer, lang: '', color: '#1890ff' },
        { label: '自定义', value: enums.InboundOrderType.Customize, lang: '', color: '#a0d911' },
    ],
    InboundOrderStatus: [
        { label: '待收货', value: enums.InboundOrderStatus.PendingReceipt, lang: '' },
        { label: '验货中', value: enums.InboundOrderStatus.UnderInspection, lang: '', color: '#faad14' },
        { label: '上架中', value: enums.InboundOrderStatus.OnTheShelf, lang: '', color: '#13c2c2' },
        { label: '已上架', value: enums.InboundOrderStatus.Shelfed, lang: '', color: '#1890ff' },
        { label: '已作废', value: enums.InboundOrderStatus.Invalid, lang: '', color: '#f5222d' },
    ],
    OutboundOrderStatus: [
        { label: '待拣货', value: enums.OutboundOrderStatus.ToBePicked, lang: '', color: '' },
        { label: '拣货中', value: enums.OutboundOrderStatus.Picking, lang: '', color: '#faad14' },
        { label: '待出库', value: enums.OutboundOrderStatus.TobeOut, lang: '', color: '#1890ff' },
        { label: '已出库', value: enums.OutboundOrderStatus.Outofstock, lang: '', color: '#a0d911' },
        { label: '已作废', value: enums.OutboundOrderStatus.Invalid, lang: '', color: '#f5222d' },
    ],
    PickListStatus: [
        { label: '拣货中', value: enums.PickListStatus.Picking, lang: '', color: '#faad14' },
        { label: '已完成', value: enums.PickListStatus.Complete, lang: '', color: '#1890ff' },
    ],
    OutboundOrderType: [
        { label: '调拨', value: enums.OutboundOrderType.Transfer, lang: '', color: '#eb2f96' },
        { label: '销售', value: enums.OutboundOrderType.Sale, lang: '', color: '#2f54eb' },
        { label: '采购退货', value: enums.OutboundOrderType.PurchaseReturn, lang: '', color: '#bfbfbf' },
        { label: '自定义', value: enums.OutboundOrderType.Customize, lang: '', color: '#722ed1' },
    ],
    WarehouseCheckStatus: [
        { label: '待盘点', value: enums.WarehouseCheckStatus.Waiting, lang: '', color: '' },
        { label: '盘点中', value: enums.WarehouseCheckStatus.Checking, lang: '', color: '#faad14' },
        { label: '已盘点', value: enums.WarehouseCheckStatus.Checked, lang: '', color: '#13c2c2' },
        { label: '已作废', value: enums.WarehouseCheckStatus.Invalid, lang: '', color: '#f5222d' },
    ],
    OrderChangeLogType: [
        { label: '入库单', value: enums.OrderChangeLogType.InboundOrder, lang: '', color: '#faad14' },
        { label: '出库单', value: enums.OrderChangeLogType.OutboundOrder, lang: '', color: '#13c2c2' },
    ],
    LossReportOrderStatus: [
        { label: '待处理', value: enums.LossReportOrderStatus.ToBeProcessed, lang: '', color: '' },
        { label: '已处理', value: enums.LossReportOrderStatus.Processed, lang: '', color: '#faad14' },
        { label: '已作废', value: enums.LossReportOrderStatus.Invalid, lang: '', color: '#f5222d' },
    ],
    ClientIntentionType: [
        { label: '未知', value: enums.ClientIntentionType.UNKNOWN, lang: '', color: '' },
        { label: '有意向', value: enums.ClientIntentionType.HAVE, lang: '', color: '#faad14' },
        { label: '已确定', value: enums.ClientIntentionType.USED, lang: '', color: '#13c2c2' },
        { label: '无意向', value: enums.ClientIntentionType.NO, lang: '', color: '#f5222d' },
    ],
}