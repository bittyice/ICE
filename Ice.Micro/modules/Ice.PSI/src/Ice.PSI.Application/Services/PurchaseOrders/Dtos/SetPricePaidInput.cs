using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.PurchaseOrders
{
    public class SetPricePaidInput
    {
        [Range(0, 99999999)]
        public decimal PricePaid { get; set; }
    }
}
