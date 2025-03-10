using System;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.Auth.Core;

public class Company : AggregateRoot<Guid>, IMultiTenant
{
    public string Name { get; set; }

    public string? Contact { get; set; }

    public string? Phone { get; set; }

    /// <summary>
    /// 所在省份
    /// </summary>
    public string? Province { get; set; }

    /// <summary>
    /// 城市
    /// </summary>
    public string? City { get; set; }

    /// <summary>
    /// 区
    /// </summary>
    public string? Town { get; set; }

    /// <summary>
    /// 街道
    /// </summary>
    public string? Street { get; set; }

    /// <summary>
    /// 详细地址
    /// </summary>
    public string? AddressDetail { get; set; }

    /// <summary>
    /// 邮编
    /// </summary>
    public string? Postcode { get; set; }

    public string? ExtraInfo { get; set; }

    public Guid? TenantId { get; set; }

    protected Company() {}

    public Company(string name) {
        Name = name;
    }
}