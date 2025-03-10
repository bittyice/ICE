using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Outbounds.Dtos
{
    public class PickInput
    {
        public string LocationCode { get; set; }
        
        public string Sku { get; set; }
        
        public int Quantity { get; set; }
    }
}
