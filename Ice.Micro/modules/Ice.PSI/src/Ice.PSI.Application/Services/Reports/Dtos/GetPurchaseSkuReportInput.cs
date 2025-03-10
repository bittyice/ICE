using Ice.PSI.Core;
using Ice.PSI.Dtos;
using Ice.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.Reports
{
    public class GetPurchaseSkuReportInput : IcePageRequestDto
    {
        public Guid? SupplierId { get; set; }

        public string? Sku { get; set; }

        public int? Status { get; set; }

        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }

        public DateTimeOffset? FinishDateMin { get; set; }

        public DateTimeOffset? FinishDateMax { get; set; }
    }
}
