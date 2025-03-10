using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Kanbans.Dtos
{
    public class GetOrderQuantityOutput
    {
        public InOutSkuNum Week { get; set; }
        public InOutSkuNum Month { get; set; }
        public InOutSkuNum Quarter { get; set; }
        public InOutSkuNum Year { get; set; }
    }

    public class InOutSkuNum
    {
        public long In { get; set; }
        public long Out { get; set; }
    }
}
