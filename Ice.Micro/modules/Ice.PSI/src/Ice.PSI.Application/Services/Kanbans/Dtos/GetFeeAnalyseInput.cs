using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.Kanbans
{
    public class GetFeeAnalyseInput
    {
        public DateTimeOffset StartTime { get; set; }

        public DateTimeOffset EndTime { get; set; }

        public bool? IsSettlement { get; set; }
    }
}
