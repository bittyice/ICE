using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class OutboundDetailDto
    {
        public Guid Id { get; set; }

        public string Sku { get; set; }

        public int Quantity { get; set; }

        /// <summary>
        /// 已分拣数量
        /// </summary>
        public int SortedQuantity { get; set; }

        /// <summary>
        /// 商品总金额
        /// </summary>
        public decimal TotalAmount { get; protected set; }

        public Guid OutboundOrderId { get; set; }

        public Guid? TenantId { get; set; }
    }
}
