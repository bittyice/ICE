using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.OnOffShelfs.Dtos
{
    public class OnShelfInput
    {
        public string LocationCode { get; set; }

        [Required]
        public Guid WarehouseId { get; set; }

        public string Sku { get; set; }

        [RegularExpression("^[a-z|A-Z|0-9|_|-]*$", ErrorMessage = "批次号必须是字母或数字或-_组成")]
        public string InboundBatch { get; set; }

        public int Quantity { get; set; }

        public DateTimeOffset? ShelfLise { get; set; }
        
        public bool Enforce { get; set; }
    }
}
