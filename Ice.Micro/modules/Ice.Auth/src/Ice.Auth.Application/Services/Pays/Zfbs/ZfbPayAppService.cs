
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Threading.Tasks;
using Aop.Api.Util;
using Ice.Auth.Core;
using Ice.Auth.Dtos;
using Ice.Auth.Enums;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;

namespace Ice.Auth.Services.Pays;

public class ZfbPayAppService : AuthAppService
{
    protected ZfbPay ZfbPay { get; set; }

    protected IRepository<PayOrder, Guid> PayOrderRepository { get; }

    protected TenantManager TenantManager { get; }

    public ZfbPayAppService(
        ZfbPay zfbPay,
        IRepository<PayOrder, Guid> payOrderRepository,
        TenantManager tenantManager
    )
    {
        ZfbPay = zfbPay;
        PayOrderRepository = payOrderRepository;
        TenantManager = tenantManager;
    }

    /// <summary>
    /// 充值
    /// </summary>
    /// <param name="input"></param>
    /// <returns></returns>
    /// <exception cref="UserFriendlyException"></exception>
    [Authorize(Roles = IceRoleTypes.Admin)]
    [AccessLimit(15, 3600, "WxPay_Recharge")]
    public async Task<PayOrderDto> RechargeAsync(RechargeInput input)
    {
        if (await PayOrderRepository.AnyAsync(e => e.Status == PayOrderStatus.Pending && e.EffectiveTime > DateTime.Now))
        {
            throw new UserFriendlyException("你有待支付的订单，请取消或者支付该订单后再重新进行充值");
        }

        double price = Math.Round((double)input.Price / 100, 2);
        string description = $"账号充值{price}元";
        string orderNumber = Tool.CommonOrderNumberCreate();

        string formstr = ZfbPay.Create(orderNumber, price);

        Logger.LogInformation($"支付宝下单成功,订单号:{orderNumber}");

        PayOrder order = new PayOrder(GuidGenerator.Create(), orderNumber, PayOrderType.ZFB, description, input.Price, formstr);
        await PayOrderRepository.InsertAsync(order);

        return ObjectMapper.Map<PayOrder, PayOrderDto>(order);
    }

    /// <summary>
    /// 取消订单
    /// </summary>
    /// <returns></returns>
    [Authorize(Roles = IceRoleTypes.Admin)]
    public async Task CloseOrder(CancelOrderInput input)
    {
        var order = await PayOrderRepository.FirstOrDefaultAsync(e => e.OrderNumber == input.OrderNumber);
        if (order == null)
        {
            throw new EntityNotFoundException();
        }

        try
        {
            ZfbPay.Close(order.OrderNumber);
            order.Cancel();
            Logger.LogInformation($"支付宝关闭订单成功,订单号:{order.OrderNumber}");
        }
        catch (Exception e)
        {
            Logger.LogError($"支付宝关闭订单失败,订单号:{order.OrderNumber}，错误消息：{e.Message}", e);
            throw new UserFriendlyException($"关闭订单失败，错误消息：{e.Message}");
        }
    }

    /// <summary>
    /// 检查支付状态
    /// </summary>
    /// <returns></returns>
    [Authorize(Roles = IceRoleTypes.Admin)]
    public async Task<bool> CheckPayStatus(CheckPayStatusInput input)
    {
        var order = await PayOrderRepository.FirstOrDefaultAsync(e => e.OrderNumber == input.OrderNumber && e.Status == PayOrderStatus.Pending);
        if (order == null)
        {
            throw new EntityNotFoundException();
        }

        var respone = ZfbPay.Query(order.OrderNumber);
        if (respone == null)
        {
            return false;
        }

        if (respone.TradeStatus != "TRADE_SUCCESS")
        {
            return false;
        }

        await TenantRecharge(order, respone.TradeNo, System.Text.Json.JsonSerializer.Serialize(respone));
        return true;
    }

    [RemoteService(IsEnabled = false)]
    public async Task<string> Notify(Dictionary<string, string> sArray)
    {
        if (sArray.Count == 0)
        {
            Logger.LogInformation("校验失败1");
            return "fail";
        }

        bool flag = ZfbPay.RSACheck(sArray);
        if (!flag)
        {
            Logger.LogInformation("校验失败2");
            return "fail";
        }

        //交易状态
        //判断该笔订单是否在商户网站中已经做过处理
        //如果没有做过处理，根据订单号（out_trade_no）在商户网站的订单系统中查到该笔订单的详细，并执行商户的业务程序
        //请务必判断请求时的total_amount与通知时获取的total_fee为一致的
        //如果有做过处理，不执行商户的业务程序

        //注意：
        //退款日期超过可退款期限后（如三个月可退款），支付宝系统发送该交易状态通知

        if (sArray["trade_status"] != "TRADE_SUCCESS")
        {
            Logger.LogInformation("校验失败3");
            return "fail";
        }

        string trade_no = sArray["trade_no"];
        string out_trade_no = sArray["out_trade_no"];
        if (string.IsNullOrWhiteSpace(out_trade_no) || string.IsNullOrWhiteSpace(trade_no))
        {
            Logger.LogInformation("校验失败4");
            return "fail";
        }

        using (DataFilter.Disable<IMultiTenant>())
        {
            var order = await PayOrderRepository.FirstOrDefaultAsync(e => e.OrderNumber == out_trade_no);
            await TenantRecharge(order, trade_no, System.Text.Json.JsonSerializer.Serialize(sArray));
            Logger.LogInformation($"支付宝支付成功，订单号{out_trade_no}");
            Logger.LogInformation($"已成功对租户{order.TenantId.Value.ToString()}进行充值，订单号{out_trade_no}");
        }

        Logger.LogInformation("成功");
        return "success";
    }

    /// <summary>
    /// 订单已支付成功
    /// </summary>
    /// <param name="order"></param>
    /// <returns></returns>
    protected async Task TenantRecharge(PayOrder order, string transactionId, string payInfo)
    {
        order.Pay(transactionId, payInfo);
        await TenantManager.Recharge(order.TenantId.Value, order.Price, order.TransactionId, $"支付宝充值￥");
    }
}
