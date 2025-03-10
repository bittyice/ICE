using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.InventoryAlerts.Dtos
{
    public class UpdateInput
    {
        public int Quantity { get; set; }

        public bool IsActive { get; set; }
    }
}
