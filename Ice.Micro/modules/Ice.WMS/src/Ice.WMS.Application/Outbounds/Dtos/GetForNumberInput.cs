using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Outbounds.Dtos
{
    public class GetForNumberInput
    {
        public string OutboundNumber { get; set; }

        [Required]
        public Guid WarehouseId { get; set; }
    }
}
