using System;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.AI.Core;

// 客服话术
public class Client : AggregateRoot<Guid>, IMultiTenant, IHasCreationTime
{
    public string? Name { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    // 使用意向 ClientIntentionType
    public string Intention { get; set; }

    public Guid? TenantId { get; protected set; }

    public DateTime CreationTime { get; protected set; }
}