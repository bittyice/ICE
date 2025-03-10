using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.SaleOrders
{
    public class ConfirmInput
    {
        [Required]
        [Range(0, 99999999)]
        public decimal TotalPrice { get; set; }
    }
}
