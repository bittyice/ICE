using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.PSI.Core.ProductStocks
{
    public class ProductStock : AggregateRoot<Guid>, IMultiTenant
    {
        protected ProductStock() { }

        public ProductStock(string sku)
        {
            Sku = sku;
        }

        // SKU
        public string Sku { get; protected set; }

        // 产品库存
        public int Stock { get; protected set; }

        public Guid? TenantId { get; protected set; }

        public void AddStock(int quantity) {
            this.Stock = this.Stock + quantity;
        }

        public void SubStock(int quantity) {
            this.Stock = this.Stock - quantity;
        }

        public void SetStock(int quantity) {
            this.Stock = quantity;
        }
    }
}
