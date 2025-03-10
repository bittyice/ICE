using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.Quotes
{
    public class ImportInput
    {
        [Required]
        public Guid SupplierId { get; set; }

        public List<ImportItem> Items { get; set; }
    }

    public class ImportItem 
    {
        [Required]
        public string Sku { get; set; }

        [Required]
        public decimal Price { get; set; }

        public DateTimeOffset? Expiration { get; set; }
    }
}
