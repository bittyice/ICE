using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Dtos
{
    public class PurchaseReturnDetailDto
    {
        public Guid Id { get; set; }

        public string Sku { get; set; }

        public int Quantity { get; set; }

        public decimal Price { get; set; }
    }
}
