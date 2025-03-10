using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.PSI.Core.SaleReturnOrders
{
    public class SaleReturnDetail: Entity<Guid>, IMultiTenant
    {
        /// <summary>
        /// Sku
        /// </summary>
        public string Sku { get; protected set; }

        /// <summary>
        /// 数量
        /// </summary>
        public int Quantity { get; protected set; }

        /// <summary>
        /// 单价
        /// </summary>
        public decimal UnitPrice { get; protected set; }

        /// <summary>
        /// 退货订单ID
        /// </summary>
        public Guid SaleReturnOrderId { get; protected set; }

        public Guid? TenantId { get; set; }

        protected SaleReturnDetail() { }

        public SaleReturnDetail(Guid id, string sku, int quantity, decimal unitPrice)
        {
            Id = id;
            Sku = sku;
            Quantity = quantity;
            UnitPrice = unitPrice;
        }
    }
}
