using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.AI.Services.Clients
{
    public class CreateInput
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; }

        [Required]
        [MaxLength(50)]
        public string Phone { get; set; }

        public string? Email { get; set; }

        [Required]
        [MaxLength(50)]
        public string Intention { get; set; }
    }
}
