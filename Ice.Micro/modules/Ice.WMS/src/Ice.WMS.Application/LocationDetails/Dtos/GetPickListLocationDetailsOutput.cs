using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.LocationDetails.Dtos
{
    public class GetPickListLocationDetailsOutput
    {
        public List<PickListLocationDetail> items { get; set; }

        public class PickListLocationDetail
        {
            public string Sku { get; set; }

            public int Quantity { get; set; }

            public string LocationCode { get; set; }

            public string InboundBatch { get; set; }
        }
    }
}
