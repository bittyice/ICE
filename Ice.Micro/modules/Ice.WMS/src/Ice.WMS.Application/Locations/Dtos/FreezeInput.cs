using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Locations.Dtos
{
    public class FreezeInput
    {
        [Required]
        public Guid WarehouseId { get; set; }

        [Required]
        public string LocationCode { get; set; }

        [Required]
        public string Sku { get; set; }
    }
}
