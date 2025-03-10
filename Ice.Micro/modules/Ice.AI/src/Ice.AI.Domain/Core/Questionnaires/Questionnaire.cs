using System;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.AI.Core;

public class Questionnaire : AggregateRoot<Guid>, IMultiTenant
{
    public string Question { get; set; }

    public Guid? TenantId { get; protected set; }
}