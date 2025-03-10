using Ice.Utils;
using Ice.WMS.Core;
using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.WarehouseTransfers.Dtos
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string TransferNumber { get; set; }

        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }

        public Guid? OriginWarehouseId { get; set; }

        public Guid? DestinationWarehouseId { get; set; }
    }
}
