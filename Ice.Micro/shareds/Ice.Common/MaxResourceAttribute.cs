using Microsoft.AspNetCore.Mvc.Filters;
using Volo.Abp;

public abstract class MaxResourceAttribute : Attribute, IAsyncActionFilter
{
    protected abstract int MaxResourceNum { get; }

    protected abstract Task<int> GetCurrentResourceNum(IServiceProvider serviceProvider);

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        int resourceNum = await GetCurrentResourceNum(context.HttpContext.RequestServices);

        if (resourceNum >= MaxResourceNum)
        {
            throw new UserFriendlyException(message: "已到达最大资源数，无法再新建更多。");
        }

        await next();
    }
}