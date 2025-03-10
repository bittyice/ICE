using System;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.AI.Dtos;

public class QuestionnaireResultDto
{
    public Guid Id { get; set; }

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

    public DateTimeOffset CreationTime { get; set; }
}