using Ice.WMS.Core;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class WarehouseTransferDto
    {
        public Guid Id { get; set; }

        public string TransferNumber { get; set; }

        public Guid OriginWarehouseId { get; set; }

        public Guid OutboundOrderId { get; set; }

        public Guid DestinationWarehouseId { get; set; }

        public Guid? InboundOrderId { get; set; }

        public Guid? TenantId { get; set; }

        public DateTimeOffset CreationTime { get; set; }

        public Guid? CreatorId { get; set; }
    }
}
