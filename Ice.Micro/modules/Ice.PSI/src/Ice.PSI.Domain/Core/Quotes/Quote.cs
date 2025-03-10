using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Ice.PSI.Core.Quotes
{
    public class Quote : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        public string Sku { get; protected set; }

        public decimal Price { get; set; }

        public DateTime? Expiration { get; set; }

        public Guid? TenantId { get; protected set; }

        public Guid SupplierId { get; protected set; }

        protected Quote() { }

        public Quote(Guid id, string sku, Guid supplierId, Guid tenantId)
        {
            Id = id;
            Sku = sku;
            TenantId = tenantId;
            SupplierId = supplierId;
        }
    }
}
