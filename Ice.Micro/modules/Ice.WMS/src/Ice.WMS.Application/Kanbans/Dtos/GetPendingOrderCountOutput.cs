using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Kanbans.Dtos
{
    public class GetPendingOrderCountOutput
    {
        public int Inbound { get; set; }

        public int Outbound { get; set; }
    }
}
