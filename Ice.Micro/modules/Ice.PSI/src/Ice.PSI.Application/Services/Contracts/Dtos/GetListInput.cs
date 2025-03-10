using Ice.PSI.Dtos;
using Ice.Utils;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Services.Contracts
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string? ContractNumber { get; set; }

        public string? ContractName { get; set; }

        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }
    }
}
