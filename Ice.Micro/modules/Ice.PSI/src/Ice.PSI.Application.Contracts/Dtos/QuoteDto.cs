using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Dtos
{
    public class QuoteDto
    {
        public Guid Id { get; set; }

        public string Sku { get; set; }

        public decimal Price { get; set; }

        public DateTimeOffset? Expiration { get; set; }

        public Guid SupplierId { get; set; }

        public DateTimeOffset? LastModificationTime { get; set; }

        public DateTimeOffset CreationTime { get; set; }

        public Guid? CreatorId { get; set; }
    }
}
