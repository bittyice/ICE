using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Ice.PSI.Core.PurchaseReturnOrders
{
    public class PurchaseReturnOrder : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        public string OrderNumber { get; protected set; }

        public PurchaseReturnOrderStatus Status { get; protected set; }

        public decimal Price { get; set; }

        public bool IsSettlement { get; protected set; }

        public string? Reason { get; set; }

        public string? Remark { get; set; }

        /// <summary>
        /// 完成时间
        /// </summary>
        public DateTime? FinishDate { get; protected set; }

        public Guid? TenantId { get; protected set; }

        public Guid SupplierId { get; protected set; }

        public string? ExtraInfo { get; set; }

        /// <summary>
        /// 支付方式
        /// </summary>
        public Guid? PaymentMethodId { get; set; }

        public ICollection<PurchaseReturnDetail> Details { get; protected set; }

        protected PurchaseReturnOrder() { }

        public PurchaseReturnOrder(Guid id, string orderNumber, Guid supplierId, Guid tenantId)
        {
            Id = id;
            OrderNumber = orderNumber;
            Status = PurchaseReturnOrderStatus.PendingReview;
            TenantId = tenantId;
            SupplierId = supplierId;
            Details = new List<PurchaseReturnDetail>();
            CreationTime = DateTime.Now;
        }

        public void ClearDetails()
        {
            if (Status != PurchaseReturnOrderStatus.PendingReview)
            {
                throw new UserFriendlyException(message: $"无法编辑订单{OrderNumber}，订单不是待审核状态");
            }

            Details = new List<PurchaseReturnDetail>();
        }

        public void ToReturning()
        {
            if (Status != PurchaseReturnOrderStatus.PendingReview)
            {
                throw new UserFriendlyException(message: $"状态变更失败，订单{OrderNumber}不是待审核状态");
            }

            Status = PurchaseReturnOrderStatus.Returning;
        }

        public void ToFinish()
        {
            if (Status != PurchaseReturnOrderStatus.Returning)
            {
                throw new UserFriendlyException(message: $"状态变更失败，订单{OrderNumber}不是退货中状态");
            }

            Status = PurchaseReturnOrderStatus.Completed;
            FinishDate = DateTime.Now;
        }

        /// <summary>
        /// 结算，采购中和完成采购才能结算
        /// </summary>
        public void Settlement()
        {
            if (Status != PurchaseReturnOrderStatus.Returning
                && Status != PurchaseReturnOrderStatus.Completed)
            {
                throw new UserFriendlyException(message: $"订单{OrderNumber}结算失败，只有退货中和已完成的订单才能进行结算");
            }

            IsSettlement = true;
        }

        public void Invalid()
        {
            if (Status != PurchaseReturnOrderStatus.PendingReview && Status != PurchaseReturnOrderStatus.Returning)
            {
                throw new UserFriendlyException(message: $"无法作废订单{OrderNumber}，订单不是待审核状态或者退货中状态");
            }

            Status = PurchaseReturnOrderStatus.Invalid;
        }
    }
}
