using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.Reports
{
    public class GetTurnoverQuotaOutput
    {
        public List<TurnoverQuota> Purchases { get; set; }

        public List<TurnoverQuota> PurchaseReturns { get; set; }

        public List<TurnoverQuota> Sales { get; set; }

        public List<TurnoverQuota> Returns { get; set; }
    }

    public class TurnoverQuota
    {
        public int Year { get; set; }

        public int Month { get; set; }

        public int Day { get; set; }

        public decimal Quota { get; set; }
    }
}
