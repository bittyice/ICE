using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Kanbans.Dtos
{
    public class GetOrderMonthQuantityOutput
    {
        public class StatisticOfTime
        {
            public int Year { get; set; }

            public int Month { get; set; }

            public long Quantity { get; set; }
        }

        public List<StatisticOfTime> Inbound { get; set; }

        public List<StatisticOfTime> Outbound { get; set; }
    }
}
