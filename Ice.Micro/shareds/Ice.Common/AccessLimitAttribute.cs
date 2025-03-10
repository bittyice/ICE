using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp;
using Volo.Abp.Caching;
using Volo.Abp.MultiTenancy;

public class AccessLimitAttribute : Attribute, IAsyncActionFilter
{
    /// <summary>
    /// 限制访问次数
    /// </summary>
    protected int LimitNum { get; }

    protected int LimitTime { get; }

    protected string MethodName { get; }

    /// <summary>
    /// limitTime 秒内可以访问 limitNum 次
    /// </summary>
    /// <param name="limitNum"></param>
    /// <param name="limitTime"></param>
    public AccessLimitAttribute(int limitNum, int limitTime, string methodName)
    {
        LimitNum = limitNum;
        LimitTime = limitTime;
        MethodName = methodName;
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

        AccessLimiter accessLimiter = context.HttpContext.RequestServices.GetService<AccessLimiter>();
        if (!(await accessLimiter.Access(LimitNum, LimitTime, MethodName)))
        {
            throw new UserFriendlyException(message: "你访问太频繁了");
        }
        await next();
    }
}