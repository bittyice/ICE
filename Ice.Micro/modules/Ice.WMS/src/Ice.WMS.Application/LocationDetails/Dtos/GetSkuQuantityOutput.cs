using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.LocationDetails.Dtos
{
    public class GetSkuQuantityOutput
    {
        public List<SkuQuantity> items { get; set; }

        public class SkuQuantity { 
            public string Sku { get; set; }

            public int Quantity { get; set; }

            public string LocationCode { get; set; }
        }
    }
}
