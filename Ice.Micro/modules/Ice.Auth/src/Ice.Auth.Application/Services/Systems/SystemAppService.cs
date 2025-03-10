using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Ice.Auth.Core;
using Ice.Auth.Dtos;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Caching;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;

namespace Ice.Auth.Services.Systems;

public class SystemAppService : AuthAppService
{
    protected const string AnnouncementCacheKey = "System_Announcement";

    protected IDistributedCache<Announcement> Cache { get; set; }

    public SystemAppService(
        IDistributedCache<Announcement> cache
    )
    {
        Cache = cache;
    }

    [Authorize(Roles = $"{IceRoleTypes.Admin},{IceRoleTypes.Host}")]
    public async Task<Announcement?> GetAnnouncement()
    {
        return await Cache.GetAsync(AnnouncementCacheKey);
    }

    [Authorize(Roles = IceRoleTypes.Host)]
    public async Task SetAnnouncement(Announcement announcement)
    {
        await Cache.SetAsync(AnnouncementCacheKey, announcement, new Microsoft.Extensions.Caching.Distributed.DistributedCacheEntryOptions()
        {
            AbsoluteExpiration = announcement.Expiration
        });
    }
}

[IgnoreMultiTenancy]
public class Announcement
{
    public string Title { get; set; }

    public string Content { get; set; }

    public DateTimeOffset Expiration { get; set; }
}