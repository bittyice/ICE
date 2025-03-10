using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.WarehouseChecks.Dtos
{
    public class CheckInput
    {
        public string LocationCode { get; set; }

        public string Sku { get; set; }

        public string InboundBatch { get; set; }

        public int Quantity { get; set; }

        public DateTimeOffset? ShelfLise { get; set; }

        [Required]
        public Guid WarehouseId { get; set; }

        public Guid? WarehouseCheckId{get;set;}
    }
}
