using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.Base.Services.ProductInfos
{
    public class GetWithDetailsForSkuInput
    {
        [Required]
        public string Sku { get; set; }
    }
}
