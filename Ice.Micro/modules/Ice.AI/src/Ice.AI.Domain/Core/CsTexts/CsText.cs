using System;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.AI.Core;

// 客服话术
public class CsText : AggregateRoot<Guid>, IMultiTenant
{
    // 组名称
    public string GroupName { get; set; }

    // 文本列表，Json格式
    public string TextList { get; set; }

    public Guid? TenantId { get; protected set; }
}