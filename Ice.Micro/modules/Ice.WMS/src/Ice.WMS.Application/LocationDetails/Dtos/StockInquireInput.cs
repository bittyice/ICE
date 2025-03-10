using Ice.Utils;
using Ice.WMS.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.LocationDetails.Dtos
{
    public class StockInquireInput : IcePageRequestDto
    {
        public Guid? WarehouseId { get; set; }

        public string Sku { get; set; }
    }
}
