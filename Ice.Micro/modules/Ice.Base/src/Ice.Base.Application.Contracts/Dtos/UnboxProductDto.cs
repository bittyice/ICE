using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.Base.Dtos
{
    public class UnboxProductDto
    {
        public Guid Id { get; set; }

        public string Sku { get; set; }

        public int Quantity { get; set; }

        public Guid ProductInfoId { get; set; }
    }
}
