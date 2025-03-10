using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.PSI.Core.PurchaseReturnOrders
{
    public class PurchaseReturnDetail : Entity<Guid>, IMultiTenant
    {
        public string Sku { get; protected set; }

        /// <summary>
        /// 退货数量
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// 退货单价
        /// </summary>
        public decimal Price { get; set; }

        public Guid? TenantId { get; protected set; }

        public Guid PurchaseReturnOrderId { get; protected set; }

        protected PurchaseReturnDetail() { }

        public PurchaseReturnDetail(Guid id, string sku, Guid tenantId)
        {
            Id = id;
            Sku = sku;
            TenantId = tenantId;
        }
    }
}
