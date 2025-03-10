
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ice.Auth.Core;
using Ice.Auth.Dtos;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Domain.Repositories;

namespace Ice.Auth.Services.IdentitySecurityLogs;

[Authorize]
public class IdentitySecurityLogAppService : AuthAppService
{
    protected IRepository<IdentitySecurityLog, Guid> IdentitySecurityLogRepository { get; }

    public IdentitySecurityLogAppService(
        IRepository<IdentitySecurityLog, Guid> identitySecurityLogRepository)
    {
        IdentitySecurityLogRepository = identitySecurityLogRepository;
    }

    public async Task<List<IdentitySecurityLogDto>> GetRecentLoginLogList()
    {
        var list = (await IdentitySecurityLogRepository.GetQueryableAsync()).Where(e => e.UserId == CurrentUser.Id).OrderByDescending(e => e.CreationTime).Skip(0).Take(10).ToList();
        return ObjectMapper.Map<List<IdentitySecurityLog>, List<IdentitySecurityLogDto>>(list);
    }
}