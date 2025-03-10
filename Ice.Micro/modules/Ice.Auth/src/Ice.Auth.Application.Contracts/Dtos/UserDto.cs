
using System;

namespace Ice.Auth.Dtos;

public class UserDto
{
    public Guid Id { get; set; }

    public Guid? TenantId { get; set; }

    public DateTimeOffset? LockoutEnd { get; set; }

    public bool TwoFactorEnabled { get; set; }

    public bool PhoneNumberConfirmed { get; set; }

    public string? PhoneNumber { get; set; }

    public bool EmailConfirmed { get; set; }

    public string? NormalizedEmail { get; set; }

    public string? Email { get; set; }

    public string? NormalizedUserName { get; set; }

    public string? UserName { get; set; }

    public bool LockoutEnabled { get; set; }

    public string? WxOpenId { get; set; }
}