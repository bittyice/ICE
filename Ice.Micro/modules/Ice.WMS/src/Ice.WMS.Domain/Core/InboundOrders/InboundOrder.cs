using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.Guids;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.InboundOrders
{
    public class InboundOrder : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        protected InboundOrder() { }

        public InboundOrder(Guid id, string inboundNumber, InboundOrderType type, Guid warehouseId, Guid tenantId)
        {
            Id = id;
            InboundNumber = inboundNumber;
            Type = type;
            WarehouseId = warehouseId;
            TenantId = tenantId;
            Status = InboundOrderStatus.PendingReceipt;

            InboundDetails = new List<InboundDetail>();
        }

        /// <summary>
        /// 去验货
        /// </summary>
        public void ToCheck() {
            if (Status != InboundOrderStatus.PendingReceipt)
            {
                throw new UserFriendlyException(message: $"状态变更失败，订单状态不是待收货");
            }

            Status = InboundOrderStatus.UnderInspection;
        }

        /// <summary>
        /// 查验
        /// </summary>
        /// <param name="actualQuantity"></param>
        public void Check(
            string sku, 
            DateTime? shelfLise,
            int actualQuantity)
        {
            if (Status != InboundOrderStatus.UnderInspection) {
                throw new UserFriendlyException(message: $"查验失败，订单状态不是待查验");
            }

            var inboundDetail = InboundDetails.FirstOrDefault(e => e.Sku == sku);
            if (inboundDetail == null) {
                throw new UserFriendlyException(message: $"查验失败，SKU：{sku}不存在");
            }

            inboundDetail.Check(shelfLise, actualQuantity);
        }

        /// <summary>
        /// 去上架
        /// </summary>
        public void ToOnShelf() {
            if (Status != InboundOrderStatus.UnderInspection)
            {
                throw new UserFriendlyException(message: $"状态变更失败，订单状态不是待查验");
            }

            if (InboundDetails.Sum(e => e.ActualQuantity) == 0) 
            {
                throw new UserFriendlyException(message: $"完成查验失败，订单实际数量不能为0");
            }

            Status = InboundOrderStatus.OnTheShelf;
        }

        /// <summary>
        /// 跳过查验
        /// </summary>
        public void SkipCheck() {
            if (Status != InboundOrderStatus.UnderInspection)
            {
                throw new UserFriendlyException(message: $"查验失败，订单状态不是待查验");
            }

            foreach(var detail in InboundDetails){
                detail.Check(detail.ShelfLise, detail.ForecastQuantity);
            }
            Status = InboundOrderStatus.OnTheShelf;
        }

        /// <summary>
        /// 上架
        /// </summary>
        /// <param name="shelvesQuantity"></param>
        public void OnShelf(string sku, int shelvesQuantity)
        {
            if (Status != InboundOrderStatus.OnTheShelf)
            {
                throw new UserFriendlyException(message: $"上架失败，订单状态不是上架中");
            }

            var inboundDetail = InboundDetails.FirstOrDefault(e => e.Sku == sku);
            if (inboundDetail == null)
            {
                throw new UserFriendlyException(message: $"上架失败，SKU：{sku}不存在");
            }

            inboundDetail.OnShelf(shelvesQuantity);
        }

        /// <summary>
        /// 完成上架
        /// </summary>
        /// <exception cref="UserFriendlyException"></exception>
        public void FinishOnShelf() {
            if (Status != InboundOrderStatus.OnTheShelf)
            {
                throw new UserFriendlyException(message: $"状态变更失败，订单状态不是上架中");
            }

            if (InboundDetails.Sum(e => e.ShelvesQuantity) == 0)
            {
                throw new UserFriendlyException(message: $"完成上架失败，订单上架数量不能为0");
            }

            Status = InboundOrderStatus.Shelfed;
            FinishTime = DateTime.Now;
        }

        /// <summary>
        /// 添加入库明细
        /// </summary>
        /// <param name="sku"></param>
        /// <param name="name"></param>
        /// <param name="forecastQuantity"></param>
        /// <param name="tenantId"></param>
        /// <param name="guidGenerator"></param>
        public void AddInboundDetail(InboundDetail inboundDetail) {
            if (Status != InboundOrderStatus.PendingReceipt)
            {
                throw new UserFriendlyException(message: $"操作失败，订单状态不是待收货");
            }

            if (InboundDetails.Any(e => e.Sku == inboundDetail.Sku)) {
                throw new UserFriendlyException(message: $"操作失败，SKU已重复");
            }

            if (InboundDetails.Count > 50) {
                throw new UserFriendlyException(message: $"入库单明细太多了，最多只能包含50个明细");
            }

            InboundDetails.Add(inboundDetail);
        }

        /// <summary>
        /// 清理入库单
        /// </summary>
        /// <exception cref="UserFriendlyException"></exception>
        public void ClearInboundDetail() {
            if (Status != InboundOrderStatus.PendingReceipt)
            {
                throw new UserFriendlyException(message: $"订单状态不是待收货");
            }

            InboundDetails = new List<InboundDetail>();
        }

        /// <summary>
        /// 作废
        /// </summary>
        public void Invalid() {
            if (Type != InboundOrderType.Customize && Type != InboundOrderType.Transfer)
            {
                throw new UserFriendlyException(message: $"只能作废自定义和调拨类型的订单");
            }

            if (Status != InboundOrderStatus.PendingReceipt && Status != InboundOrderStatus.UnderInspection) {
                throw new UserFriendlyException(message: $"只有待收货和验货中的订单才能作废");
            }

            Status = InboundOrderStatus.Invalid;
        }

        /// <summary>
        /// 入库单号
        /// </summary>
        public string InboundNumber { get; protected set; }

        /// <summary>
        /// 入库批次号
        /// </summary>
        public string InboundBatch { get; set; }

        /// <summary>
        /// 入库类型
        /// </summary>
        public InboundOrderType Type { get; protected set; }

        /// <summary>
        /// 入库单状态
        /// </summary>
        public InboundOrderStatus Status { get; protected set; }

        /// <summary>
        /// 完成上架时间
        /// </summary>
        public DateTime? FinishTime { get; protected set; }

        /// <summary>
        /// 仓库
        /// </summary>
        public Guid WarehouseId { get; protected set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string Remark { get; set; }

        /// <summary>
        /// 扩展信息（仅供前端使用）
        /// </summary>
        public string ExtraInfo { get; set; }

        /// <summary>
        /// 其他信息
        /// </summary>
        public string OtherInfo { get; set; }

        public Guid? TenantId { get; protected set; }

        public ICollection<InboundDetail> InboundDetails { get; protected set; }
    }
}
