using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.Base.Core.ProductInfos
{
    public class UnboxProduct : Entity<Guid>, IMultiTenant
    {
        public string Sku { get; set; }

        public int Quantity { get; set; }

        public Guid ProductInfoId { get; set; }

        public Guid? TenantId { get; protected set; }

        protected UnboxProduct() { }

        public UnboxProduct(Guid id, string sku, int quantity) { 
            Id = id;
            Sku = sku;
            Quantity = quantity;
        }
    }
}
