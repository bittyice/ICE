using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.LocationDetails.Dtos
{
    public class StockInquireOutput
    {
    }

    public class StockInquireOutputItem 
    {
        public string Sku { get; set; }

        public int Quantity { get; set; }
    }
}
