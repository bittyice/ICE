using System;
using System.Threading.Tasks;
using Ice.Auth.Core;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp;
using Volo.Abp.Caching;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;

namespace Ice.Auth.Filters;

public class AmountLimitAttribute : Attribute, IAsyncActionFilter
{
    /// <summary>
    /// 限制访问次数
    /// </summary>
    protected int LimitAmount { get; }

    /// <summary>
    /// limitTime 秒内可以访问 limitNum 次
    /// </summary>
    /// <param name="limitAmount">限制的费用，单位分</param>
    public AmountLimitAttribute(int limitAmount)
    {
        LimitAmount = limitAmount;
    }

    public async Task OnActionExecutionAsync(
        ActionExecutingContext context,
        ActionExecutionDelegate next)
    {
        var currentTenant = context.HttpContext.RequestServices.GetService<CurrentTenant>();

        if (currentTenant?.Id == null)
        {
            await next();
        }

        IRepository<Tenant> tenantRepository = context.HttpContext.RequestServices.GetService<IRepository<Tenant>>();
        var tenant = await tenantRepository.FirstOrDefaultAsync(e => e.Id == currentTenant.Id);
        if (tenant == null)
        {
            throw new UserFriendlyException(message: "无效的租户");
        }
        if (tenant.Amount < LimitAmount)
        {
            throw new UserFriendlyException(message: $"请确保余额大于 {LimitAmount / 100} RMB才能访问该功能");
        }
        await next();
    }
}