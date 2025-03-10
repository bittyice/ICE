using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ice.Auth.Core;
using Ice.Auth.Dtos;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace Ice.Auth.Services.OpenServices;

public class OpenServiceAppService : AuthAppService
{
    protected TenantManager TenantManager { get; set; }

    protected IRepository<OpenService> Repository { get; set; }

    public OpenServiceAppService(
        TenantManager tenantManager,
        IRepository<OpenService> repository
    )
    {
        TenantManager = tenantManager;
        Repository = repository;
    }

    // 系统允许的服务
    [Authorize]
    public async Task<List<AllowOpenService>> GetSystemOpenServices()
    {
        return WebConfiguration.AuthConfig.OpenServices;
    }

    // 获取已开通的服务
    [Authorize(Roles = IceRoleTypes.Admin)]
    public async Task<List<OpenServiceDto>> GetOpenServices()
    {
        var list = await Repository.GetListAsync();
        return ObjectMapper.Map<List<OpenService>, List<OpenServiceDto>>(list);
    }

    // 延长服务1年
    [Authorize(Roles = IceRoleTypes.Admin)]
    public async Task ExtendOpenServiceDueDate(ExtendOpenServiceDueDateInput input)
    {
        // 查找服务费用
        var curOpenService = WebConfiguration.AuthConfig.OpenServices.FirstOrDefault(e => e.Key == input.Key);
        if (curOpenService == null)
        {
            throw new System.Exception($"延长服务出错，无效的服务 {input.Key}");
        }

        // 如果当前服务有基本服务，则需要先开通基本服务
        if (!string.IsNullOrEmpty(curOpenService.Base))
        {
            var baseOpenService = await Repository.FirstOrDefaultAsync(e => e.Name == curOpenService.Base);
            if (baseOpenService == null || !baseOpenService.IsValid())
            {
                throw new UserFriendlyException("请先开通基本服务才能开通延长服务");
            }
        }

        await TenantManager.ExtendOpenServiceDueDate(CurrentTenant.Id.Value, curOpenService.Name, new TimeSpan(curOpenService.Daynum, 0, 0, 0), curOpenService.Fee);
    }
}