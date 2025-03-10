using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.Areas.Dtos
{
    public class UpdateInput
    {

        public string AllowSpecifications { get; set; }

        public string ForbidSpecifications { get; set; }

        public bool IsActive { get; set; }
    }
}
