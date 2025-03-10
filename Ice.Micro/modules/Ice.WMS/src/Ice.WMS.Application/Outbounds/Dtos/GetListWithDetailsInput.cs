using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Outbounds.Dtos
{
    public class GetListWithDetailsInput
    {
        public List<Guid> Ids { get; set; }
    }
}
