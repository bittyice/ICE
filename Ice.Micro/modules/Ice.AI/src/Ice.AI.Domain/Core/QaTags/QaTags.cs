using System;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.AI.Core;

public class QaTag : AggregateRoot<Guid>, IMultiTenant
{
    // 标签名
    public string Name { get; set; }

    public Guid? TenantId { get; protected set; }
}