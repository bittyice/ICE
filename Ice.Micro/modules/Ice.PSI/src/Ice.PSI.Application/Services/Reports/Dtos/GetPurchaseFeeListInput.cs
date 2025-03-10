using Ice.PSI.Core;
using Ice.PSI.Dtos;
using Ice.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.Reports
{
    public class GetPurchaseFeeListInput : IcePageRequestDto
    {
        public Guid? SupplierId { get; set; }

        public PurchaseOrderStatus? Status { get; set; }

        public bool? IsSettlement { get; set; }

        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }

        public DateTimeOffset? FinishDateMin { get; set; }

        public DateTimeOffset? FinishDateMax { get; set; }
    }
}
