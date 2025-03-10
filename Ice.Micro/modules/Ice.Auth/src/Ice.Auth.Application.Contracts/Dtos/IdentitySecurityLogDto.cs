using System;

namespace Ice.Auth.Dtos;

public class IdentitySecurityLogDto
{
    public Guid? TenantId { get; set; }

    public Guid? UserId { get; set; }

    public string? UserName { get; set; }

    public DateTimeOffset CreationTime { get; set; }
}