using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Outbounds.Dtos
{
    public class PushOrderToTmsInput
    {
        public List<Guid> OrderIds { get; set; }
    }
}
