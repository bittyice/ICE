using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.LocationDetails.Dtos
{
    public class GetLocationDetailForSkuInput
    {
        [Required]
        public string LocationCode { get; set; }

        [Required]
        public string Sku { get; set; }

        [Required]
        public Guid WarehouseId { get; set; }
    }
}
