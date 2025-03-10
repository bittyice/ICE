using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.Auth.Services.GuestBlacklists
{
    public class CreateInput
    {
        [Required]
        public string Ip { get; set; }
    }
}
