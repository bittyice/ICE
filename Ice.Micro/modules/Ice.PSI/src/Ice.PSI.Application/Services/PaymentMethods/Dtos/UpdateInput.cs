using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.PaymentMethods
{
    public class UpdateInput
    {
        [Required]
        public string Name { get; set; }

        public string? CardNumber { get; set; }

        public string? Describe { get; set; }
    }
}
