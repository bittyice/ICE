using Ice.PSI.Core;
using Ice.PSI.Dtos;
using Ice.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.SaleReturnOrders
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string? OrderNumber { get; set; }

        public string? SaleNumber { get; set; }

        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }

        public string? Status { get; set; }
    }
}
