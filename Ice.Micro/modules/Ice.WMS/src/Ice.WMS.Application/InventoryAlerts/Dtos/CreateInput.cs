using Ice.WMS.Core;
using Ice.WMS.Core.InboundOrders;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.InventoryAlerts.Dtos
{
    public class CreateInput
    {
        [Required]
        public string Sku { get; set; }

        [Required]
        public int Quantity { get; set; }

        public bool IsActive { get; set; }

        [Required]
        public Guid WarehouseId { get; set; }
    }
}
