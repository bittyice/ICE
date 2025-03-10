using Ice.PSI.Core;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Dtos
{
    public class PurchaseReturnOrderDto
    {
        public Guid Id { get; set; }

        public string OrderNumber { get; set; }

        public PurchaseReturnOrderStatus Status { get; set; }

        public decimal Price { get; set; }

        public bool IsSettlement { get; set; }

        public string? Reason { get; set; }

        public string? Remark { get; set; }

        public Guid SupplierId { get; set; }

        public string? ExtraInfo { get; set; }

        public DateTimeOffset? FinishDate { get; set; }

        public DateTimeOffset CreationTime { get; set; }

        public ICollection<PurchaseReturnDetailDto> Details { get; set; }

        public Guid? PaymentMethodId { get; set; }
    }
}
