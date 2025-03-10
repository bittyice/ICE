using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.Base.Services.ProductInfos
{
    public class GetAllOutput
    {
        public List<GetAllOutputItem> Items { get; set; }
    }

    public class GetAllOutputItem { 
        public string Sku { get; set; }

        public string Name { get; set; }

        public string? Unit { get; set; }
    }
}
