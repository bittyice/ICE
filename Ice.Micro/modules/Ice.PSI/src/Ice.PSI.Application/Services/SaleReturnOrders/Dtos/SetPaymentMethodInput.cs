using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.SaleReturnOrders
{
    public class SetPaymentMethodInput
    {
        public Guid? PaymentMethodId { get; set; }
    }
}
