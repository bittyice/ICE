
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.MultiTenancy;

namespace Ice.Micro;

public static class TenantMiddlewareExtensions
{
    public static IApplicationBuilder UseIceTenant(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<TenantMiddleware>();
    }
}

public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User == null || context.User.Identity?.IsAuthenticated != true)
        {
            await _next(context);
            return;
        }

        var tenantid = context.User.FindFirst("tenantid");

        if (tenantid == null)
        {
            await _next(context);
            return;
        }

        Guid tenantGuid;
        if (!Guid.TryParse(tenantid.Value, out tenantGuid))
        {
            await _next(context);
            return;
        }

        var currentTenant = context.RequestServices.GetService<ICurrentTenant>();
        if (currentTenant == null)
        {
            throw new Exception("获取ICurrentTenant服务失败");
        }
        
        using (currentTenant.Change(tenantGuid))
        {
            await _next(context);
        }
    }
}