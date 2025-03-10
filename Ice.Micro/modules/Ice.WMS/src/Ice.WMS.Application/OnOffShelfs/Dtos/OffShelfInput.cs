using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.OnOffShelfs.Dtos
{
    public class OffShelfInput
    {
        public string LocationCode { get; set; }

        [Required]
        public Guid WarehouseId { get; set; }

        public string Sku { get; set; }

        public int Quantity { get; set; }
    }
}
