

using System;
using System.Linq;
using System.Threading.Tasks;
using Ice.Auth.Core;
using Ice.Auth.Enums;
using Microsoft.Extensions.Logging;
using SKIT.FlurlHttpClient.Wechat.TenpayV3;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Uow;

namespace Ice.Auth.Services.Pays;

public class WxPayHandler : ITransientDependency
{
    protected IRepository<PayOrder, Guid> PayOrderRepository { get; }

    protected WxPayHelper WxPayHelper { get; }

    protected TenantManager TenantManager { get; }

    protected IDataFilter DataFilter { get; }

    protected IUnitOfWorkManager UnitOfWorkManager { get; }

    protected ILogger<WxPayHandler> Logger { get; }

    public WxPayHandler(
        IRepository<PayOrder, Guid> payOrderRepository,
        WxPayHelper wxPayHelper,
        TenantManager tenantManager,
        IDataFilter dataFilter,
        IUnitOfWorkManager unitOfWorkManager,
        ILogger<WxPayHandler> logger)
    {
        PayOrderRepository = payOrderRepository;
        WxPayHelper = wxPayHelper;
        TenantManager = tenantManager;
        DataFilter = dataFilter;
        UnitOfWorkManager = unitOfWorkManager;
        Logger = logger;
    }

    /// <summary>
    /// 描述: 如果订单过了有效时间还未支付, 则查询订单状态, 如果已支付则更新状态, 如果为支付则关闭订单
    /// </summary>
    /// <returns></returns>
    public async Task Handle()
    {
        using (DataFilter.Disable<IMultiTenant>())
        {
            DateTime now = DateTime.Now;
            var list = (await PayOrderRepository.GetQueryableAsync()).Where(e => e.EffectiveTime < now && e.Status == PayOrderStatus.Pending && e.Type == PayOrderType.WX).Select(e => e.Id);
            var wxClient = WxPayHelper.GetWechatTenpayClient();

            foreach (var orderId in list)
            {
                using (var uow = UnitOfWorkManager.Begin(requiresNew: true, isTransactional: true))
                {
                    var order = await PayOrderRepository.FindAsync(orderId);
                    try
                    {
                        var respone = await wxClient.ExecuteGetPayTransactionByOutTradeNumberAsync(new SKIT.FlurlHttpClient.Wechat.TenpayV3.Models.GetPayTransactionByOutTradeNumberRequest()
                        {
                            OutTradeNumber = order.OrderNumber
                        });

                        if (respone.TradeState == "SUCCESS")
                        {
                            await TenantRecharge(order, respone.TransactionId, System.Text.Json.JsonSerializer.Serialize(respone));
                        }
                        else
                        {
                            await CloseOrder(order);
                        }

                        await uow.CompleteAsync();
                    }
                    catch
                    {
                    }
                }
            }
        }
    }

    /// <summary>
    /// 关闭订单
    /// </summary>
    /// <param name="order"></param>
    /// <returns></returns>
    protected async Task CloseOrder(PayOrder order)
    {
        var wxClient = WxPayHelper.GetWechatTenpayClient();
        var respone = await wxClient.ExecuteClosePayTransactionAsync(new SKIT.FlurlHttpClient.Wechat.TenpayV3.Models.ClosePayTransactionRequest()
        {
            OutTradeNumber = order.OrderNumber
        });

        if (respone.IsSuccessful())
        {
            Logger.LogInformation($"微信关闭订单成功,订单号:{order.OrderNumber}");
            order.Cancel();
        }

        // 当前订单已关闭
        if (respone.ErrorCode == "ORDER_CLOSED")
        {
            Logger.LogInformation($"微信关闭订单成功,订单号:{order.OrderNumber}");
            order.Cancel();
        }

        // 订单不存在	
        if (respone.ErrorCode == "ORDERNOTEXIST")
        {
            Logger.LogInformation($"微信关闭订单成功,订单号:{order.OrderNumber}");
            order.Cancel();
        }
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