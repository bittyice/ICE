using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.LossReportOrders
{
    public class LossReportOrder : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        public string OrderNumber { get; protected set; }

        public LossReportOrderStatus Status { get; protected set; }

        /// <summary>
        /// 扩展信息（仅供前端使用）
        /// </summary>
        public string ExtraInfo { get; set; }

        public Guid WarehouseId { get; protected set; }

        public Guid? TenantId { get; protected set; }

        public ICollection<LossReportDetail> Details { get; protected set; }

        protected LossReportOrder() { }

        public LossReportOrder(Guid id, string orderNumber, Guid warehouseId, Guid? tenantId)
        {
            Id = id;
            OrderNumber = orderNumber;
            WarehouseId = warehouseId;
            Status = LossReportOrderStatus.ToBeProcessed;
            TenantId = tenantId;
            Details = new List<LossReportDetail>();
        }

        public void AddDetail(LossReportDetail detail) {
            if (Status != LossReportOrderStatus.ToBeProcessed)
            {
                throw new UserFriendlyException(message: $"操作失败，订单状态不是待处理");
            }

            if (Details.Any(e => e.Sku == detail.Sku))
            {
                throw new UserFriendlyException(message: $"操作失败，SKU已重复");
            }

            if (Details.Count > 50)
            {
                throw new UserFriendlyException(message: $"报损单明细太多了，最多只能包含50个明细");
            }

            Details.Add(detail);
        }

        public void ClearDetail() {
            if (Status != LossReportOrderStatus.ToBeProcessed)
            {
                throw new UserFriendlyException(message: $"操作失败，订单状态不是待处理");
            }

            Details = new List<LossReportDetail>();
        }

        public void ToProcessed() {
            if (Status != LossReportOrderStatus.ToBeProcessed)
            {
                throw new UserFriendlyException(message: $"操作失败，订单状态不是待处理");
            }

            Status = LossReportOrderStatus.Processed;
        }

        public void Invalid() {
            if (Status != LossReportOrderStatus.ToBeProcessed)
            {
                throw new UserFriendlyException(message: $"作废失败，订单状态不是待处理");
            }

            Status = LossReportOrderStatus.Invalid;
        }
    }
}
