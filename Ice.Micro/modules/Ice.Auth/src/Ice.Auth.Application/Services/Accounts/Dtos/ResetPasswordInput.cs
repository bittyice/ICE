using System.ComponentModel.DataAnnotations;

namespace Ice.Auth.Services.Accounts;

public class ResetPasswordInput {
    [Phone]
    [Required]
    public string Phone { get; set; }

    [Required]
    public string Token { get; set; }

    [Required]
    public string Password { get; set; }
}