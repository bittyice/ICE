using System;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.AI.Core;

public class QuestionnaireResult : AggregateRoot<Guid>, IMultiTenant, IHasCreationTime
{
    // 已 Json 数组格式存放
    public string? Questions { get; set; }

    // 已 Json 数组格式存放
    public string? Results { get; set; }

    public string? ChatRecords { get; set; }

    public string? GuestName { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? TagName { get; set; }

    public string? Ip { get; set; }

    public string? Province { get; set; }

    // 关注的内容，以回车分隔
    public string? FocusQuestion { get; set; }

    public Guid? TenantId { get; protected set; }

    public DateTime CreationTime { get; protected set; }
}