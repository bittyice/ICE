using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.Quotes
{
    public class UpdateInput
    {
        public decimal Price { get; set; }

        public DateTimeOffset? Expiration { get; set; }

        [Required]
        public Guid SupplierId { get; set; }
    }
}
