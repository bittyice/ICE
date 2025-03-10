using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.LocationDetails.Dtos
{
    public class StockInquireForSkusInput
    {
        public Guid? WarehouseId { get; set; }

        public List<string> Skus { get; set; }
    }
}
