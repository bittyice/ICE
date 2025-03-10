
using System;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.Auth.Core;

public class AmountAdjust : AggregateRoot<Guid>, IMultiTenant, IHasCreationTime
{
    /// <summary>
    /// 调整前余额
    /// </summary>
    public int OldAmount { get; protected set; }

    /// <summary>
    /// 调整类型
    /// </summary>
    /// <see cref="Ice.Auth.Enums.AmountAdjustType"/>
    public string Type { get; protected set; }

    /// <summary>
    /// 调整额度
    /// </summary>
    public int AdjustFee { get; protected set; }

    /// <summary>
    /// 关联第三方订单号
    /// </summary>
    public string? OuterNumber { get; protected set; }

    /// <summary>
    /// 备注
    /// </summary>
    public string? Remark { get; protected set; }

    public Guid? TenantId { get; protected set; }

    public DateTime CreationTime { get; protected set; }

    protected AmountAdjust() { }

    public AmountAdjust(int oldAmount, string type, int adjustFee, string? outerNumber, string? remark, Guid? tenantId)
    {
        OldAmount = oldAmount;
        Type = type;
        AdjustFee = adjustFee;
        OuterNumber = outerNumber;
        Remark = remark;
        TenantId = tenantId;
        CreationTime = DateTime.Now;
    }
}