using Ice.Utils;
using Ice.WMS.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.LocationDetails.Dtos
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string Sku { get; set; }

        public string InboundBatch { get; set; }

        public bool? HasInboundBatch { get; set; }

        public bool? IsFreeze { get; set; }

        public string LocationCode { get; set; }

        public DateTimeOffset? ShelfLiseMin { get; set; }

        public DateTimeOffset? ShelfLiseMax { get; set; }

        [Required]
        public Guid WarehouseId { get; set; }
    }
}
