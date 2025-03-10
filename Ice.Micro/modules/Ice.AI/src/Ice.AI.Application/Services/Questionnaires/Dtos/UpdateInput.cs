using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.AI.Services.Questionnaires
{
    public class UpdateInput
    {
        [Required]
        [MaxLength(30)]
        public string Question { get; set; }
    }
}
