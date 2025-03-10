using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.Base.Services.ProductInfos
{
    public class GetAllOfSystemOutput
    {
    }

    public class GetAllOfSystemOutputItem { 
        public Guid? TenantId { get; set; }

        public string Sku { get; set; }
    }
}
