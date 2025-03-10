namespace Ice.Auth.Services.Accounts;

public class ChangePasswordInput
{
    public string OldPassword { get; set; }

    public string NewPassword { get; set; }
}