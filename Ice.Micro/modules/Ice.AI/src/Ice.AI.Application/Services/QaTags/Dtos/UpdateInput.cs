using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.AI.Services.QaTags
{
    public class UpdateInput
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; }
    }
}
