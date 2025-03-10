
using System;
using Ice.Auth.Enums;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.Auth.Core;

public class PayOrder : AggregateRoot<Guid>, IMultiTenant
{
    /// <summary>
    /// 支付单号
    /// </summary>
    public string OrderNumber { get; protected set; }

    /// <summary>
    /// 订单类型 微信 | 支付宝
    /// </summary>
    /// <see cref="Ice.Auth.Enums.PayOrderType"/>
    public string Type { get; protected set; }

    /// <summary>
    /// 第三方订单号
    /// </summary>
    public string? TransactionId { get; protected set; }

    /// <summary>
    /// 描述
    /// </summary>
    public string Description { get; protected set; }

    /// <summary>
    /// 价格，已分为单位
    /// </summary>
    public int Price { get; protected set; }

    /// <summary>
    /// 状态
    /// </summary>
    /// <see cref="Ice.Auth.Enums.PayOrderStatus"/>
    public string Status { get; protected set; }

    /// <summary>
    /// 支付链接
    /// </summary>
    public string PayUrl { get; protected set; }

    /// <summary>
    /// 第三方支付信息
    /// </summary>
    public string? PayInfo { get; protected set; }

    /// <summary>
    /// 支付的有效时间, 需要再该时间端内进行支付, 如果到期还未支付, 系统会自动取消订单
    /// </summary>
    public DateTime EffectiveTime { get; protected set; }

    /// <summary>
    /// 创建时间
    /// </summary>
    public DateTime CreatedTime { get; protected set; }

    /// <summary>
    /// 支付时间
    /// </summary>
    public DateTime? PayTime { get; protected set; }

    /// <summary>
    /// 订单取消时间
    /// </summary>
    public DateTime? CancelTime { get; protected set; }

    /// <summary>
    /// 租户ID
    /// </summary>
    public Guid? TenantId { get; protected set; }

    protected PayOrder() {}

    public PayOrder(Guid id, string orderNumber, string type, string description, int price, string payUrl)
    {
        Id = id;
        OrderNumber = orderNumber;
        Type = type;
        Description = description;
        Price = price;
        PayUrl = payUrl;
        Status = PayOrderStatus.Pending;
        CreatedTime = DateTime.Now;
        EffectiveTime = DateTime.Now.AddMinutes(15);
    }

    public void Pay(string transactionId, string payInfo)
    {
        // 这里本应该进行状态判断再修改属性的，但由于Pay方法是由第三方主动调用，我们不希望调用失败，所以这里不进行状态判断
        TransactionId = transactionId;
        PayInfo = payInfo;
        Status = PayOrderStatus.Paid;
        PayTime = DateTime.Now;
    }

    public void Cancel()
    {
        if (Status != PayOrderStatus.Pending)
        {
            throw new UserFriendlyException("无法取消订单，订单不是待支付状态");
        }

        Status = PayOrderStatus.Cancelled;
        CancelTime = DateTime.Now;
    }
}