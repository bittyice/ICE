using Ice.PSI.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.Reports
{
    public class ProductReportItem
    {
        public string Sku { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public Guid SupplierId { get; set; }

        public int Status { get; set; }

        public DateTime CreationTime { get; set; }

        public DateTime? FinishDate { get; set; }
    }
}
