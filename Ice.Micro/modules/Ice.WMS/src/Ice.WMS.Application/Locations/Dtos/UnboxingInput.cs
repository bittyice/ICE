using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Locations.Dtos
{
    public class UnboxingInput
    {
        [Required]
        public Guid WarehouseId { get; set; }

        [Required]
        public string UnboxLocationCode { get; set; }

        [Required]
        public string UnboxSku { get; set; }

        [Required]
        public int UnboxQuantity { get; set; }

        [Required]
        public string OnshlefLocationCode { get; set; }

        [Required]
        public List<UpshlefProductItem> OnshlefItems { get; set; }
    }

    public class UpshlefProductItem
    {
        [Required]
        public string Sku { get; set; }

        [Required]
        public int Quantity { get; set; }
    }
}
