using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Ice.PSI.Core.Suppliers
{
    public class Supplier : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        public string Code { get; protected set; }

        public string Name { get; set; }

        public string Contact { get; set; }

        public string? ContactNumber { get; set; }

        public bool IsActive { get; set; }

        public Guid? TenantId { get; protected set; }

        public string? ExtraInfo { get; set; }

        protected Supplier() { }

        public Supplier(Guid id, string code, string name, string contact, Guid tenantId)
        {
            Id = id;
            Code = code;
            Name = name;
            Contact = contact;
            TenantId = tenantId;
        }
    }
}
