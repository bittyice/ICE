﻿using Ice.PSI.Core;
using Ice.PSI.Dtos;
using Ice.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.PurchaseReturnOrders
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string? OrderNumber { get; set; }

        public bool? IsSettlement { get; set; }

        public Guid? SupplierId { get; set; }

        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }

        public PurchaseReturnOrderStatus? Status { get; set; }
    }
}
