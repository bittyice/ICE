
using System;
using Volo.Abp;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;

namespace Ice.Auth.Core;

public class Tenant : AggregateRoot<Guid>, IHasCreationTime, ISoftDelete
{
    // 余额，以分为单位
    public int Amount { get; protected set; }

    // 访客 key
    public string GuestKey { get; protected set; }

    // 销售员
    public string? Saler { get; protected set; }

    public bool IsActive { get; set; }

    public DateTime CreationTime { get; protected set; }

    public bool IsDeleted { get; protected set; }

    public Tenant()
    {
        this.Amount = 0;
        this.IsActive = true;
        this.CreationTime = DateTime.Now;
        this.GuestKey = Guid.NewGuid().ToString();
    }

    // 花费
    public void Cost(int money)
    {
        if (Amount < money)
        {
            throw new UserFriendlyException("余额不足，请先进行充值操作");
        }
        Amount = Amount - money;
    }

    public void SystemDeduct(int money)
    {
        Amount = Amount - money;
    }

    // 充值
    public void Recharge(int money)
    {
        Amount = Amount + money;
    }

    // 调整金额
    public void AdjustAmount(int amount)
    {
        Amount = amount;
    }

    // 重置访客KEY
    public void ResetGuestKey()
    {
        GuestKey = Guid.NewGuid().ToString();
    }

    // 设置销售员
    public void SetSaler(string saler)
    {
        Saler = saler;
    }
}
