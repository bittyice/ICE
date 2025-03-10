using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using static Ice.Auth.Helpers.VerificationCodeHelper;

namespace Ice.Auth.Services.Accounts;

public class SendSmsInput
{
    [Phone]
    [Required]
    public string Phone { get; set; }

    [Required]
    public string VerificationCodeSign { get; set; }

    [Required]
    public List<Position> Position { get; set; }
}