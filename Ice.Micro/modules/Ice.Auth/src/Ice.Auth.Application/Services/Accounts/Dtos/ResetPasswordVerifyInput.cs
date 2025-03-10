using System.ComponentModel.DataAnnotations;

namespace Ice.Auth.Services.Accounts;

public class ResetPasswordVerifyInput {
    [Phone]
    [Required]
    public string Phone { get; set; }

    [Required]
    public string SmsCode { get; set; }
}