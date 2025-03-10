using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Dtos
{
    public class ContractDto
    {
        public Guid Id { get; set; }

        public string ContractNumber { get; set; }

        public string ContractName { get; set; }

        public DateTimeOffset? EffectiveTime { get; set; }

        public DateTimeOffset? Expiration { get; set; }

        public string? AppendixUrl { get; set; }

        public string? ExtraInfo { get; set; }

        public Guid SupplierId { get; set; }

        public virtual DateTimeOffset? LastModificationTime { get; set; }

        public virtual DateTimeOffset CreationTime { get; set; }
    }
}
