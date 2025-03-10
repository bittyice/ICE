using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Inbounds.Dtos
{
    public class OnShelfInput
    {
        [Required]
        public string Sku { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public string LocationCode { get; set; }

        public bool Enforce { get; set; }
    }
}
