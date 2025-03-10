using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.AI.Services.CsTexts
{
    public class UpdateInput
    {
        [Required]
        [MaxLength(50)]
        public string GroupName { get; set; }

        [Required]
        [MaxLength(1000)]
        public string TextList { get; set; }
    }
}
