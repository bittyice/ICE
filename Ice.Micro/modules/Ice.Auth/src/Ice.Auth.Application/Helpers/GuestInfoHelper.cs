using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Volo.Abp.Caching;
using Volo.Abp.DependencyInjection;

namespace Ice.Auth;

public class GuestInfoHelper : IScopedDependency
{
    protected IDistributedCache<LoginInfo> LoginInfoCache { get; }

    public GuestInfoHelper(
        IDistributedCache<LoginInfo> loginInfoCache
    )
    {
        LoginInfoCache = loginInfoCache;
    }

    public async Task SetLoginInfo(string id, LoginInfo loginInfo, TimeSpan timeSpan)
    {
        await LoginInfoCache.SetAsync(id, loginInfo, new DistributedCacheEntryOptions()
        {
            AbsoluteExpirationRelativeToNow = timeSpan,
        });
    }

    public async Task<LoginInfo?> GetLoginInfo(string id)
    {
        return await LoginInfoCache.GetAsync(id);
    }
}

public class LoginInfo
{
    public string? Ip { get; set; }

    public string? Province { get; set; }

    public string? City { get; set; }

    public double? Lat { get; set; }

    public double? Lon { get; set; }
}