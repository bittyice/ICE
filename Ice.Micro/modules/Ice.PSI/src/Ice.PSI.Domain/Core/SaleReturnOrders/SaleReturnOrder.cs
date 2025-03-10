using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Ice.PSI.Core.SaleReturnOrders
{
    public class SaleReturnOrder : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        /// <summary>
        /// 订单号
        /// </summary>
        public string OrderNumber { get; protected set; }

        /// <summary>
        /// 关联补货单号
        /// </summary>
        public string? SaleNumber { get; protected set; }

        /// <summary>
        /// 客户名称
        /// </summary>
        public string BusinessName { get; set; }

        /// <summary>
        /// 状态
        /// </summary>
        /// <see cref="SaleReturnOrderStatus"/>
        public string Status { get; protected set; }

        /// <summary>
        /// 是否结算
        /// </summary>
        public bool IsSettlement { get; protected set; }

        /// <summary>
        /// 退货总金额
        /// </summary>
        public decimal TotalPrice { get; protected set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string? Remark { get; set; }

        /// <summary>
        /// 驳回原因
        /// </summary>
        public string? RejectReason { get; protected set; }

        /// <summary>
        /// 完成时间
        /// </summary>
        public DateTime? FinishDate { get; protected set; }

        /// <summary>
        /// 扩展信息
        /// </summary>
        public string? ExtraInfo { get; set; }

        /// <summary>
        /// 支付方式
        /// </summary>
        public Guid? PaymentMethodId { get; set; }

        public Guid? TenantId { get; protected set; }

        public ICollection<SaleReturnDetail> Details { get; set; }

        protected SaleReturnOrder() { }

        public SaleReturnOrder(Guid id, string orderNumber, string saleNumber, Guid tenantId)
        {
            Id = id;
            OrderNumber = orderNumber;
            SaleNumber = saleNumber;
            Status = SaleReturnOrderStatus.WaitConfirm;
            TenantId = tenantId;
            Details = new List<SaleReturnDetail>();
        }

        public void ClearDetails()
        {
            if (Status != SaleReturnOrderStatus.WaitConfirm)
            {
                throw new UserFriendlyException(message: $"编辑失败，订单不是待确认状态");
            }

            Details = new List<SaleReturnDetail>();
        }

        /// <summary>
        /// 驳回退货
        /// </summary>
        /// <param name="rejectReason"></param>
        /// <exception cref="UserFriendlyException"></exception>
        public void Rejected(string rejectReason)
        {
            if (Status != SaleReturnOrderStatus.WaitConfirm)
            {
                throw new UserFriendlyException(message: $"驳回失败，退货状态不是待确认状态");
            }
            Status = SaleReturnOrderStatus.Rejected;
            RejectReason = rejectReason;
        }

        /// <summary>
        /// 通过退货申请
        /// </summary>
        /// <param name="totalPrice">实际退货金额</param>
        /// <param name="returnAddress">退货地址</param>
        /// <exception cref="UserFriendlyException"></exception>
        public void ConfirmReturn(decimal totalPrice)
        {
            if (Status != SaleReturnOrderStatus.WaitConfirm)
            {
                throw new UserFriendlyException(message: $"状态变更失败，退货状态不是待确认状态");
            }

            TotalPrice = totalPrice;
            Status = SaleReturnOrderStatus.ToBeProcessed;
        }

        /// <summary>
        /// 取消确认
        /// </summary>
        public void UnconfirmReturn()
        {
            if (Status != SaleReturnOrderStatus.ToBeProcessed)
            {
                throw new UserFriendlyException(message: $"状态变更失败，退货状态不是待处理状态");
            }

            TotalPrice = 0;
            Status = SaleReturnOrderStatus.WaitConfirm;
        }

        /// <summary>
        /// 处理
        /// </summary>
        public void ProcessedReturn()
        {
            if (Status != SaleReturnOrderStatus.ToBeProcessed)
            {
                throw new UserFriendlyException(message: $"状态变更失败，退货状态不是待处理状态");
            }

            Status = SaleReturnOrderStatus.Returning;
        }

        /// <summary>
        /// 完成退货
        /// </summary>
        public void CompletedReturn()
        {
            if (Status != SaleReturnOrderStatus.Returning)
            {
                throw new UserFriendlyException(message: $"状态变更失败，退货状态不是退货中状态");
            }
            Status = SaleReturnOrderStatus.Completed;
            FinishDate = DateTime.Now;
        }

        /// <summary>
        /// 退货结算
        /// </summary>
        public void ReturnSettlement()
        {
            if (Status != SaleReturnOrderStatus.Completed)
            {
                throw new UserFriendlyException(message: $"完成退货后才能进行结算");
            }

            IsSettlement = true;
        }
    }
}
