using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class InboundDetailDto
    {
        public Guid Id { get; set; }

        /// <summary>
        /// SKU
        /// </summary>
        public string Sku { get; set; }

        /// <summary>
        /// 预报数量
        /// </summary>
        public int ForecastQuantity { get; set; }

        /// <summary>
        /// 实际数量
        /// </summary>
        public int ActualQuantity { get; set; }

        /// <summary>
        /// 上架数量
        /// </summary>
        public int ShelvesQuantity { get; set; }

        /// <summary>
        /// 过期时间
        /// </summary>
        public DateTimeOffset? ShelfLise { get; set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string Remark { get; set; }

        /// <summary>
        /// 商品总金额
        /// </summary>
        public decimal TotalAmount { get; protected set; }

        public Guid InboundOrderId { get; set; }

        public Guid? TenantId { get; set; }
    }
}
