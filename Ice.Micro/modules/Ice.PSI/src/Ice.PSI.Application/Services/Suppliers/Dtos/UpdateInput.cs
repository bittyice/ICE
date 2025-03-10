using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.Suppliers
{
    public class UpdateInput
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Contact { get; set; }

        public string? ContactNumber { get; set; }

        public bool IsActive { get; set; }

        public string? ExtraInfo { get; set; }
    }
}
