
using System;

namespace Ice.Auth.Dtos;

public class PayOrderDto
{
    public Guid Id { get; set; }

    /// <summary>
    /// 支付单号
    /// </summary>
    public string OrderNumber { get; set; }

    public string Type { get; set; }

    /// <summary>
    /// 描述
    /// </summary>
    public string Description { get; set; }

    /// <summary>
    /// 价格
    /// </summary>
    public int Price { get; set; }

    /// <summary>
    /// 状态
    /// </summary>
    /// <see cref="Ice.TP.Core.PayOrderStatus"/>
    public string Status { get; set; }

    /// <summary>
    /// 支付链接
    /// </summary>
    public string PayUrl { get; set; }

    /// <summary>
    /// 第三方支付信息
    /// </summary>
    public string PayInfo { get; set; }

    /// <summary>
    /// 支付的有效时间, 需要再该时间端内进行支付, 如果到期还未支付, 系统会自动取消订单
    /// </summary>
    public DateTimeOffset EffectiveTime { get; set; }

    /// <summary>
    /// 创建时间
    /// </summary>
    public DateTimeOffset CreatedTime { get; set; }

    /// <summary>
    /// 支付时间
    /// </summary>
    public DateTimeOffset? PayTime { get; set; }

    /// <summary>
    /// 订单取消时间
    /// </summary>
    public DateTimeOffset? CancelTime { get; set; }
}
