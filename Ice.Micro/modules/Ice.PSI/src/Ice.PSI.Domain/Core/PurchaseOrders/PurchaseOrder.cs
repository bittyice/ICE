using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Ice.PSI.Core.PurchaseOrders
{
    public class PurchaseOrder : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        /// <summary>
        /// 订单好
        /// </summary>
        public string OrderNumber { get; protected set; }

        /// <summary>
        /// 状态
        /// </summary>
        public PurchaseOrderStatus Status { get; protected set; }

        /// <summary>
        /// 订单金额
        /// </summary>
        public decimal Price { get; set; }

        /// <summary>
        /// 已支付金额
        /// </summary>
        public decimal PricePaid { get; protected set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string? Remark { get; set; }

        /// <summary>
        /// 结算
        /// </summary>
        public bool IsSettlement { get; protected set; }

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

        public ICollection<PurchaseDetail> Details { get; protected set; }

        protected PurchaseOrder() { }

        public PurchaseOrder(Guid id, string orderNumber, Guid supplierId, Guid tenantId)
        {
            Id = id;
            OrderNumber = orderNumber;
            Status = PurchaseOrderStatus.PendingReview;
            IsSettlement = false;
            TenantId = tenantId;
            SupplierId = supplierId;
            Details = new List<PurchaseDetail>();
            CreationTime = DateTime.Now;
        }

        public void ClearDetails()
        {
            if (Status != PurchaseOrderStatus.PendingReview)
            {
                throw new UserFriendlyException(message: $"无法编辑订单{OrderNumber}，订单不是待审核状态");
            }

            Details = new List<PurchaseDetail>();
        }

        public void ToPurchasing()
        {
            if (Status != PurchaseOrderStatus.PendingReview)
            {
                throw new UserFriendlyException(message: $"状态变更失败，订单{OrderNumber}不是待审核状态");
            }

            Status = PurchaseOrderStatus.Purchasing;
        }

        public void ToFinish()
        {
            if (Status != PurchaseOrderStatus.Purchasing)
            {
                throw new UserFriendlyException(message: $"状态变更失败，订单{OrderNumber}不是待采购状态");
            }

            Status = PurchaseOrderStatus.Completed;
            FinishDate = DateTime.Now;
        }

        /// <summary>
        /// 结算，采购中和完成采购才能结算
        /// </summary>
        public void Settlement()
        {
            if (Status != PurchaseOrderStatus.Purchasing
                && Status != PurchaseOrderStatus.Completed)
            {
                throw new UserFriendlyException(message: $"订单{OrderNumber}结算失败，只有采购中和已完成的订单才能进行结算");
            }

            IsSettlement = true;
        }

        /// <summary>
        /// 设置已支付金额
        /// </summary>
        /// <param name="pricePaid"></param>
        public void SetPricePaid(decimal pricePaid)
        {
            PricePaid = pricePaid;
        }

        /// <summary>
        /// 作废
        /// </summary>
        /// <exception cref="UserFriendlyException"></exception>
        public void Invalid()
        {
            if (Status != PurchaseOrderStatus.PendingReview && Status != PurchaseOrderStatus.Purchasing)
            {
                throw new UserFriendlyException(message: $"无法作废订单{OrderNumber}，订单不是待审核状态或者待采购状态");
            }

            Status = PurchaseOrderStatus.Invalid;
        }
    }
}
