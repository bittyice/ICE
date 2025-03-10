using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Delivery100s.Dtos
{
    public class GetExpressOrdersForOrderNumInput
    {
        public List<string> OrderNumbers { get; set; }
    }
}
