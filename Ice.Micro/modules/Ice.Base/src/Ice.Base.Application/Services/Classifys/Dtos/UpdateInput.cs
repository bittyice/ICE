using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.Base.Services.Classifys
{
    public class UpdateInput
    {
        [Required]
        public string Name { get; set; }
    }
}
