using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Dtos
{
    public class SaleOrderDto
    {
        public Guid Id { get; set; }

        /// <summary>
        /// 单号
        /// </summary>
        public string OrderNumber { get; set; }

        /// <summary>
        /// 下单时价格
        /// </summary>
        public decimal PlaceTotalPrice { get; set; }

        /// <summary>
        /// 应支付金额
        /// </summary>
        public decimal TotalPrice { get; set; }

        /// <summary>
        /// 已支付总价
        /// </summary>
        public decimal TotalPricePaid { get; set; }

        /// <summary>
        /// 收货时间
        /// </summary>
        public DateTimeOffset? FinishDate { get; set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string? Remark { get; set; }

        /// <summary>
        /// 驳回原因
        /// </summary>
        public string? RejectReason { get; set; }

        /// <summary>
        /// 扩展信息（仅供前端使用）
        /// </summary>
        public string? ExtraInfo { get; set; }

        /// <summary>
        /// 状态
        /// </summary>
        /// <see cref="SaleOrderStatus"/>
        public string Status { get; set; }

        /// <summary>
        /// 是否结算
        /// </summary>
        public bool IsSettlement { get; set; }

        /// <summary>
        /// 销售员
        /// </summary>
        public string? Seller { get; set; }

        public Guid? PaymentMethodId { get; set; }

        public DateTimeOffset CreationTime { get; set; }

        public RecvInfoDto RecvInfo { get; set; }

        public ICollection<SaleDetailDto> Details { get; set; }
    }
}
