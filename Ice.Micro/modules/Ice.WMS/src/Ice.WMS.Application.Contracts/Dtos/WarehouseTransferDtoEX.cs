using Ice.WMS.Core;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class WarehouseTransferDtoEX : WarehouseTransferDto
    {
        public string OutboundOrderNumber { get; set; }

        public OutboundOrderStatus OutboundOrderStatus { get; set; }

        public string InboundOrderNumber { get; set; }

        public InboundOrderStatus? InboundOrderStatus { get; set; }
    }
}
