using Ice.WMS.Core;
using Ice.WMS.Core.InboundOrders;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.WarehouseChecks.Dtos
{
    public class CreateInput
    {
        [Required]
        public Guid Executor { get; set; }

        [Required]
        public Guid AreaId { get; set; }
    }
}
