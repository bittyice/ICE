using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.Quotes
{
    public class GetSupplierQuoteInput
    {
        public Guid SupplierId { get; set; }

        public List<string> Skus { get; set; }
    }
}
