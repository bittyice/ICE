using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Transfers.Dtos
{
    public class OnShelfInput
    {
        public Guid TransferSkuId { get; set; }
        
        public int Quantity { get; set; }

        public string LocationCode { get; set; }

        public Guid WarehouseId { get; set; }

        public bool Enforce { get; set; }
    }
}
