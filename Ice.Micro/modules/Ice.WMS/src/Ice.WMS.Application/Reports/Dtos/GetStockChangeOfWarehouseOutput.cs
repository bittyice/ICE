using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Reports.Dtos
{
    public class GetStockChangeOfWarehouseOutput
    {
        public List<StockItem> CurrentStocks { get; set; }

        public List<QueryResultItem> InboundChanges { get; set; }

        public List<QueryResultItem> OutboundChanges { get; set; }

        public class StockItem
        {
            public string Sku { get; set; }

            public int Quantity { get; set; }
        }

        public class QueryItem
        {
            public DateTime CreationTime { get; set; }

            public string Sku { get; set; }

            public int Quantity { get; set; }
        }

        public class QueryResultItem
        {
            public int Year { get; set; }

            public int Month { get; set; }

            public string Sku { get; set; }

            public long Total { get; set; }
        }
    }
}
