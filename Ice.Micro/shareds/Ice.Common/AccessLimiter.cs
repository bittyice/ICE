using Volo.Abp;
using Volo.Abp.Caching;
using Volo.Abp.DependencyInjection;
using Volo.Abp.MultiTenancy;

public class AccessLimiter : ITransientDependency
{
    protected IDistributedCache<AccessLimitData> DistributedCache { get; set; }

    protected CurrentTenant CurrentTenant { get; set; }

    public AccessLimiter(
        CurrentTenant tenant,
        IDistributedCache<AccessLimitData> cache
    )
    {
        DistributedCache = cache;
        CurrentTenant = tenant;
    }

    public async Task<bool> Access(int limitNum, int limitTime, string name)
    {
        var key = name + CurrentTenant.Id.ToString();
        var tenantAccessLimitData = await DistributedCache.GetAsync(key);
        if (tenantAccessLimitData == null)
        {
            var newTenantAccessLimitData = new AccessLimitData();
            newTenantAccessLimitData.ExpireDate = DateTime.Now.AddSeconds(limitTime);
            newTenantAccessLimitData.AccessNum = 0;
            await DistributedCache.SetAsync(key, newTenantAccessLimitData);
            return true;
        }

        if (tenantAccessLimitData.AccessNum >= limitNum)
        {
            return false;
        }

        if (tenantAccessLimitData.ExpireDate > DateTime.Now)
        {
            tenantAccessLimitData.AccessNum++;
        }
        else
        {
            tenantAccessLimitData.ExpireDate = DateTime.Now.AddSeconds(limitTime);
            tenantAccessLimitData.AccessNum = 1;
        }
        await DistributedCache.SetAsync(key, tenantAccessLimitData);

        return true;
    }
}

public class AccessLimitData
{
    /// <summary>
    /// 已访问次数
    /// </summary>
    public int AccessNum { get; set; }

    public DateTime ExpireDate { get; set; }
}