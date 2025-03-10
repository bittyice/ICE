using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.LossReportOrders.Dtos
{
    public class GetListForIdsInput
    {
        public List<Guid> Ids { get; set; }
    }
}
