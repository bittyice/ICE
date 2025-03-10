using System;

namespace Ice.Auth.Services.Tenants;

public class AdjustAmountInput
{
    public int Amount { get; set; }

    public string? Remark { get; set; }

    public Guid TenantId { get; set; }
}