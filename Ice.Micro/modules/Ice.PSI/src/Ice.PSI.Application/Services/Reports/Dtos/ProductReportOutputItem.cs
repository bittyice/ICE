using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.Reports
{
    public class ProductReportOutputItem
    {
        public string Sku { get; set; }

        public int Total { get; set; }

        public decimal TotalPrice { get; set; }
    }
}
