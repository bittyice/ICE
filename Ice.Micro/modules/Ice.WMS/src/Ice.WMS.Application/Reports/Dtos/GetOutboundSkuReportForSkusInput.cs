using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Reports.Dtos
{
    public class GetOutboundSkuReportForSkusInput
    {
        public List<string> Skus { get; set; }

        public int? Status { get; set; }

        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }

        public Guid? WarehouseId { get; set; }
    }
}
