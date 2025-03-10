using System;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.PSI.Core.PaymentMethods;

/// <summary>
/// 付款渠道
/// </summary>
public class PaymentMethod : AggregateRoot<Guid>, IMultiTenant
{
    public string Name { get; set; }

    public string? CardNumber { get; set; }

    public string? Describe { get; set; }

    public Guid? TenantId { get; protected set; }

    public PaymentMethod(string name)
    {
        Name = name;
    }
}