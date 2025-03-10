

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

public class ZfbPayHandler : ITransientDependency
{
    protected IRepository<PayOrder, Guid> PayOrderRepository { get; }

    protected ZfbPay ZfbPay { get; }

    protected TenantManager TenantManager { get; }

    protected IDataFilter DataFilter { get; }

    protected IUnitOfWorkManager UnitOfWorkManager { get; }

    protected ILogger<ZfbPayHandler> Logger { get; }

    public ZfbPayHandler(
        IRepository<PayOrder, Guid> payOrderRepository,
        ZfbPay zfbPay,
        TenantManager tenantManager,
        IDataFilter dataFilter,
        IUnitOfWorkManager unitOfWorkManager,
        ILogger<ZfbPayHandler> logger)
    {
        PayOrderRepository = payOrderRepository;
        ZfbPay = zfbPay;
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
            var list = (await PayOrderRepository.GetQueryableAsync()).Where(e => e.EffectiveTime < now && e.Status == PayOrderStatus.Pending && e.Type == PayOrderType.ZFB).Select(e => e.Id);

            foreach (var orderId in list)
            {
                using (var uow = UnitOfWorkManager.Begin(requiresNew: true, isTransactional: true))
                {
                    var order = await PayOrderRepository.FindAsync(orderId);
                    try
                    {
                        var respone = ZfbPay.Query(order.OrderNumber);

                        // 订单没有被扫过，支付宝那边没有生成订单，则是 respone == null
                        if (respone != null && respone.TradeStatus == "TRADE_SUCCESS")
                        {
                            await TenantRecharge(order, respone.TradeNo, System.Text.Json.JsonSerializer.Serialize(respone));
                        }
                        else
                        {
                            ZfbPay.Close(order.OrderNumber);
                            order.Cancel();
                        }

                        await uow.CompleteAsync();
                    }
                    catch (Exception ex)
                    {
                        Logger.LogInformation($"支付宝订单处理失败 {order.OrderNumber}", ex);
                    }
                }
            }
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
        await TenantManager.Recharge(order.TenantId.Value, order.Price, order.TransactionId, $"支付宝充值￥");
    }
}