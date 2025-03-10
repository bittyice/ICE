
using System;
using Ice.Auth.Enums;
using Volo.Abp;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.Auth.Core;

public class GuestBlacklist : AggregateRoot<Guid>, IHasCreationTime, IMultiTenant
{
    public string Ip { get; set; }

    public DateTime CreationTime { get; protected set; }
    
    public Guid? TenantId { get; protected set; }
}