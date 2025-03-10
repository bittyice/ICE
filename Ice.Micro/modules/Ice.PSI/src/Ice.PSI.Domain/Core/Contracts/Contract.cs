using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Ice.PSI.Core.Contracts
{
    public class Contract : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        public string ContractNumber { get; set; }

        public string ContractName { get; set; }

        public DateTime? EffectiveTime { get; set; }

        public DateTime? Expiration { get; set; }

        public string? AppendixUrl { get; set; }

        public string? ExtraInfo { get; set; }

        public Guid SupplierId { get; set; }

        public Guid? TenantId { get; protected set; }

        public Contract(Guid id, string contractNumber, string contractName, Guid supplierId)
        {
            Id = id;
            ContractNumber = contractNumber;
            ContractName = contractName;
            SupplierId = supplierId;
        }
    }
}
