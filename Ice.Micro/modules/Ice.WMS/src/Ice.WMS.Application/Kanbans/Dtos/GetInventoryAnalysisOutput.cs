using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Kanbans.Dtos
{
    public class GetInventoryAnalysisOutput
    {
        public int SkuTotalQuantity { get; set; }

        public int SkuExpiredQuantity { get; set; }

        public int SkuFreezeQuantity { get; set; }

        public List<AreaLocationQuantity> AreaLocationQuantitys { get; set; }

        public class AreaLocationQuantity { 
            public Guid AreaId { get; set; }

            public int Quantity { get; set; }
        }
    }
}
