using Ice.WMS.Core;
using Ice.WMS.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Outbounds.Dtos
{
    public class GetListOutput
    {
    }

    public class GetListOutputItem : OutboundOrderDto
    {
        public int SkuTotalQuantity { get; set; }

        public string ShipperCode { get; set; }

        public string ExpressNumber { get; set; }
    }
}
