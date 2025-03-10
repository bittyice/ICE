
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

public class PayAppService : AuthAppService
{
    protected IRepository<PayOrder, Guid> PayOrderRepository { get; }

    public PayAppService(
        IRepository<PayOrder, Guid> payOrderRepository)
    {
        PayOrderRepository = payOrderRepository;
    }

    /// <summary>
    /// 获取待支付的订单
    /// </summary>
    /// <returns></returns>
    [Authorize(Roles = IceRoleTypes.Admin)]
    public async Task<PayOrderDto> GetPendingPayOrder()
    {
        var order = await PayOrderRepository.FirstOrDefaultAsync(e => e.Status == PayOrderStatus.Pending && e.EffectiveTime > DateTime.Now);
        if (order == null)
        {
            return null;
        }

        return ObjectMapper.Map<PayOrder, PayOrderDto>(order);
    }

    /// <summary>
    /// 查询订单是否已支付
    /// </summary>
    /// <returns></returns>
    [Authorize(Roles = IceRoleTypes.Admin)]
    public async Task<bool> GetIsPaid(IsPaidInput input)
    {
        return (await PayOrderRepository.GetQueryableAsync()).Where(e => e.OrderNumber == input.OrderNumber).Select(e => e.Status).First() == PayOrderStatus.Paid;
    }
}
