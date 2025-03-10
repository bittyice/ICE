using Ice.Utils;
using Ice.WMS.Core;
using Ice.WMS.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Reports.Dtos
{
    public class GetInboundSkuReportInput : IcePageRequestDto
    {
        public string Sku { get; set; }

        public int? Status { get; set; }

        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }

        public Guid? WarehouseId { get; set; }

        public InboundOrderType? Type { get; set; }
    }
}
