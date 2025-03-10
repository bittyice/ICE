using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Transfers.Dtos
{
    public class OffShelfInput
    {
        [Required]
        public Guid WarehouseId { get; set; }

        [Required]
        public string LocationCode { get; set; }

        [Required]
        public string Sku { get; set; }

        [Required]
        public int Quantity { get; set; }
    }
}
