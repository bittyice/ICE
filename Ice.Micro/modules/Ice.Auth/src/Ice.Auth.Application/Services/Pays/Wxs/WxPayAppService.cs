
using System;
using System.Linq;
using System.Threading.Tasks;
using Ice.Auth.Core;
using Ice.Auth.Dtos;
using Ice.Auth.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using SKIT.FlurlHttpClient.Wechat.TenpayV3;
using SKIT.FlurlHttpClient.Wechat.TenpayV3.Events;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;
using Ice.Utils;

namespace Ice.Auth.Services.Pays;

public class WxPayAppService : AuthAppService
{
    protected IRepository<PayOrder, Guid> PayOrderRepository { get; }

    protected WxPayHelper WxPayHelper { get; }

    protected TenantManager TenantManager { get; }

    public WxPayAppService(
        IRepository<PayOrder, Guid> payOrderRepository,
        WxPayHelper wxPayHelper,
        TenantManager tenantManager)
    {
        PayOrderRepository = payOrderRepository;
        WxPayHelper = wxPayHelper;
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

        string description = $"账号充值{input.Price / 100}元";
        string orderNumber = Tool.CommonOrderNumberCreate();

        WechatTenpayClient wxClient = WxPayHelper.GetWechatTenpayClient();
        var respone = await wxClient.ExecuteCreatePayTransactionNativeAsync(new SKIT.FlurlHttpClient.Wechat.TenpayV3.Models.CreatePayTransactionNativeRequest()
        {
            AppId = WebConfiguration.WxConfig.AppId,
            Description = description,
            OutTradeNumber = orderNumber,
            NotifyUrl = WebConfiguration.WxConfig.NotifyUrl,
            Amount = new SKIT.FlurlHttpClient.Wechat.TenpayV3.Models.CreatePayTransactionNativeRequest.Types.Amount()
            {
                Total = input.Price,
                Currency = "CNY"
            }
        });

        if (!respone.IsSuccessful())
        {
            Logger.LogError($"微信下单失败,订单号:{orderNumber}，错误消息：{respone.ErrorMessage}，错误码：{respone.ErrorCode}");
            throw new UserFriendlyException($"下单失败，错误消息：{respone.ErrorMessage}，错误码：{respone.ErrorCode}");
        }

        Logger.LogInformation($"微信下单成功,订单号:{orderNumber}");

        PayOrder order = new PayOrder(GuidGenerator.Create(), orderNumber, PayOrderType.WX, description, input.Price, respone.QrcodeUrl);
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

        var wxClient = WxPayHelper.GetWechatTenpayClient();
        var respone = await wxClient.ExecuteClosePayTransactionAsync(new SKIT.FlurlHttpClient.Wechat.TenpayV3.Models.ClosePayTransactionRequest()
        {
            OutTradeNumber = order.OrderNumber
        });

        if (respone.IsSuccessful())
        {
            Logger.LogInformation($"微信关闭订单成功,订单号:{order.OrderNumber}");
            order.Cancel();
            return;
        }

        // 当前订单已关闭
        if (respone.ErrorCode == "ORDER_CLOSED")
        {
            Logger.LogInformation($"微信关闭订单成功,订单号:{order.OrderNumber}");
            order.Cancel();
            return;
        }

        // 订单不存在	
        if (respone.ErrorCode == "ORDERNOTEXIST")
        {
            Logger.LogInformation($"微信关闭订单成功,订单号:{order.OrderNumber}");
            order.Cancel();
            return;
        }

        Logger.LogError($"微信关闭订单失败,订单号:{order.OrderNumber}，错误消息：{respone.ErrorMessage}，错误码：{respone.ErrorCode}");
        throw new UserFriendlyException($"关闭订单失败，错误消息：{respone.ErrorMessage}，错误码：{respone.ErrorCode}");
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

        var wxClient = WxPayHelper.GetWechatTenpayClient();
        var respone = await wxClient.ExecuteGetPayTransactionByOutTradeNumberAsync(new SKIT.FlurlHttpClient.Wechat.TenpayV3.Models.GetPayTransactionByOutTradeNumberRequest()
        {
            OutTradeNumber = order.OrderNumber
        });

        if (respone == null || respone.TradeState != "SUCCESS")
        {
            return false;
        }

        await TenantRecharge(order, respone.TransactionId, System.Text.Json.JsonSerializer.Serialize(respone));
        return true;
    }

    /// <summary>
    /// 处理微信通知
    /// </summary>
    /// <param name="timestamp"></param>
    /// <param name="nonce"></param>
    /// <param name="signature"></param>
    /// <param name="serialNumber"></param>
    /// <param name="body"></param>
    /// <returns>true 为处理成功,false 为处理失败</returns>
    [RemoteService(IsEnabled = false)]
    public async Task<bool> Notify(
        string timestamp,
        string nonce,
        string signature,
        string serialNumber,
        string body)
    {
        Logger.LogInformation($"接收到微信支付推送的数据");

        var wxClient = WxPayHelper.GetWechatTenpayClient();
        if (!wxClient.VerifyEventSignature(timestamp, nonce, body, signature, serialNumber, out Exception error))
        {
            Logger.LogInformation($"签名验证失败，timestamp: {timestamp}, nonce: {nonce}, signature: {signature}, serialNumber: {serialNumber}");
            return false;
        }

        var callbackModel = wxClient.DeserializeEvent(body);

        // 交易成功
        if ("TRANSACTION.SUCCESS".Equals(callbackModel.EventType))
        {
            var resource = wxClient.DecryptEventResource<TransactionResource>(callbackModel);
            Logger.LogInformation($"微信支付成功，订单号{resource.OutTradeNumber}");

            using (DataFilter.Disable<IMultiTenant>())
            {
                var order = await PayOrderRepository.FirstOrDefaultAsync(e => e.OrderNumber == resource.OutTradeNumber);
                await TenantRecharge(order, resource.TransactionId, System.Text.Json.JsonSerializer.Serialize(resource));
                Logger.LogInformation($"已成功对租户{order.TenantId.Value.ToString()}进行充值，订单号{resource.OutTradeNumber}");
            }

            return true;
        }

        Logger.LogInformation($"有未处理的微信支付通知，EventType: {callbackModel.EventType}，ID: {callbackModel.Id}");
        //// 退款成功
        //if ("REFUND.SUCCESS".Equals(callbackModel.EventType))
        //{
        //    var resource = wxClient.DecryptEventResource<RefundResource>(callbackModel);
        //}

        return false;
    }

    /// <summary>
    /// 订单已支付成功
    /// </summary>
    /// <param name="order"></param>
    /// <returns></returns>
    protected async Task TenantRecharge(PayOrder order, string transactionId, string payInfo)
    {
        order.Pay(transactionId, payInfo);
        await TenantManager.Recharge(order.TenantId.Value, order.Price, order.TransactionId, $"微信充值￥");
    }
}
