using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Outbounds.Dtos
{
    public class GetPickListForNumberInput
    {
        public string PickListNumber { get; set; }

        public Guid WarehouseId { get; set; }
    }
}
