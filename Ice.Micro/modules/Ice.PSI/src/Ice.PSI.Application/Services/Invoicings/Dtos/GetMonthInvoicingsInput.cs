using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Invoicings
{
    public class GetMonthInvoicingsInput
    {
        [Required]
        public int Year { get; set; }

        [Required]
        public int Month { get; set; }
    }
}
