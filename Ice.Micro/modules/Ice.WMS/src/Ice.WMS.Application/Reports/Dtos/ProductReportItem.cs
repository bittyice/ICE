using Ice.WMS.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Reports.Dtos
{
    public class ProductReportQueryItem
    {
        public string Sku { get; set; }

        public int Quantity { get; set; }

        public int Status { get; set; }

        public DateTime CreationTime { get; set; }

        public Guid WarehouseId { get; set; }
    }
}
