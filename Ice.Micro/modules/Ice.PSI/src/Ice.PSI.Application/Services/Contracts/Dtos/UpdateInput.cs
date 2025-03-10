using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.PSI.Services.Contracts
{
    public class UpdateInput
    {
        [Required]
        public string ContractNumber { get; set; }

        [Required]
        public string ContractName { get; set; }

        public DateTimeOffset? EffectiveTime { get; set; }

        public DateTimeOffset? Expiration { get; set; }

        public string? AppendixUrl { get; set; }

        public string? ExtraInfo { get; set; }
    }
}
