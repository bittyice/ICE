using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Dtos
{
    public class SaleReturnOrderDto
    {
        public Guid Id { get; set; }

        /// <summary>
        /// 订单号
        /// </summary>
        public string OrderNumber { get; set; }

        /// <summary>
        /// 关联补货单号
        /// </summary>
        public string? SaleNumber { get; set; }

        /// <summary>
        /// 客户名称
        /// </summary>
        public string BusinessName { get; set; }

        /// <summary>
        /// 状态
        /// </summary>
        /// <see cref="SaleReturnOrderStatus"/>
        public string Status { get; set; }

        /// <summary>
        /// 是否结算
        /// </summary>
        public bool IsSettlement { get; set; }

        /// <summary>
        /// 退货总金额
        /// </summary>
        public decimal TotalPrice { get; set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string? Remark { get; set; }

        /// <summary>
        /// 驳回原因
        /// </summary>
        public string? RejectReason { get; set; }

        /// <summary>
        /// 扩展信息
        /// </summary>
        public string? ExtraInfo { get; set; }

        public DateTimeOffset? FinishDate { get; set; }

        public DateTimeOffset CreationTime { get; set; }

        public List<SaleReturnDetailDto> Details { get; set; }

        public Guid? PaymentMethodId { get; set; }
    }
}
