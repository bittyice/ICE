
using System;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.Auth.Core;

public class IdentitySecurityLog : AggregateRoot<Guid>, IMultiTenant
{
    public Guid? TenantId { get; protected set; }

    public Guid? UserId { get; set; }

    public string? UserName { get; set; }

    public DateTime CreationTime { get; set; }

    protected IdentitySecurityLog() { }

    public IdentitySecurityLog(Guid id, Guid? tenantId)
    {
        Id = id;
        TenantId = tenantId;
    }
}