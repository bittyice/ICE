using Ice.WMS.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Outbounds.Dtos
{
    public class BatchPickInput
    {
        public List<BatchPickSku> Items { get; set; }
    }
}
