using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.PSI.Core.PurchaseOrders
{
    public class PurchaseDetail : Entity<Guid>, IMultiTenant
    {
        /// <summary>
        /// Sku
        /// </summary>
        public string Sku { get; protected set; }

        /// <summary>
        /// 数量
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// 赠送数量
        /// </summary>
        public int GiveQuantity { get; set; }

        /// <summary>
        /// 单价
        /// </summary>
        public decimal Price { get; set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string? Remark { get; set; }

        public Guid? TenantId { get; protected set; }

        public Guid PurchaseOrderId { get; protected set; }

        protected PurchaseDetail() { }

        public PurchaseDetail(Guid id, string sku, Guid tenantId)
        {
            Id = id;
            Sku = sku;
            TenantId = tenantId;
        }
    }
}
