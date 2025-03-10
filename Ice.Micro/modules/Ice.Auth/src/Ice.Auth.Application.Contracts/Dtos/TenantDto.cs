

using System;

namespace Ice.Auth.Dtos;

public class TenantDto
{
    public Guid Id { get; set; }

    public int Amount { get; set; }

    public bool IsActive { get; set; }

    public string GuestKey { get; set; }

    public string? Saler { get; set; }

    public DateTimeOffset CreationTime { get; set; }
}