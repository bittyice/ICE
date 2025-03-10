using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ice.Auth.Core;
using Ice.Auth.Dtos;
using Ice.Auth.Enums;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Data;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Ice.Utils;
using Volo.Abp.MultiTenancy;

namespace Ice.Auth.Services.Tenants;

[Authorize(Roles = IceRoleTypes.Host)]
public class TenantOfHostAppService : AuthAppService
{
    protected IRepository<User, Guid> UserRepository { get; }

    protected IRepository<Tenant, Guid> TenantRepository { get; }

    protected IRepository<OpenService, Guid> OpenServiceRepository { get; }

    protected TenantManager TenantManager { get; }

    public TenantOfHostAppService(
        IRepository<User, Guid> userRepository,
        IRepository<Tenant, Guid> tenantRepository,
        IRepository<OpenService, Guid> openServiceRepository,
        TenantManager tenantManager)
    {
        UserRepository = userRepository;
        TenantRepository = tenantRepository;
        OpenServiceRepository = openServiceRepository;
        TenantManager = tenantManager;
    }

    public async Task<PagedResultDto<TenantDtoEx>> GetListAsync(GetListInput input)
    {
        input.Sorting = nameof(Tenant.Id);

        long count;
        List<Tenant> list;
        // 禁用软删数据过滤
        using (this.DataFilter.Disable<ISoftDelete>())
        using (this.DataFilter.Disable<IMultiTenant>())
        {
            IQueryable<Tenant> queryable = await TenantRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            count = queryable.Count();
            list = queryable.IceOrderBy(input.Sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();
            List<TenantDtoEx> result = new List<TenantDtoEx>();
            var tenantIds = list.Select(e => e.Id).ToList();
            var openServices = await OpenServiceRepository.GetListAsync(e => tenantIds.Contains(e.TenantId.Value));
            var users = await UserRepository.GetListAsync(e => e.Role == IceRoleTypes.Admin && tenantIds.Contains(e.TenantId.Value));
            foreach (var item in list)
            {
                result.Add(new TenantDtoEx()
                {
                    Id = item.Id,
                    Amount = item.Amount,
                    IsActive = item.IsActive,
                    GuestKey = item.GuestKey,
                    Saler = item.Saler,
                    CreationTime = new DateTimeOffset(item.CreationTime),
                    AdminPhone = users.FirstOrDefault(e => e.TenantId == item.Id)?.PhoneNumber,
                    OpenServices = ObjectMapper.Map<List<OpenService>, List<OpenServiceDto>>(openServices.Where(e => e.TenantId == item.Id).ToList())
                });
            }

            return new PagedResultDto<TenantDtoEx>(
                count,
                result
            );
        }
    }

    public async Task<TenantDtoEx> GetAsync(Guid id)
    {
        Tenant tenant;
        using (this.DataFilter.Disable<ISoftDelete>())
        {
            tenant = await this.TenantRepository.FindAsync(id);
            var openServices = await OpenServiceRepository.GetListAsync(e => tenant.Id == e.TenantId);
            return new TenantDtoEx()
            {
                Id = tenant.Id,
                Amount = tenant.Amount,
                IsActive = tenant.IsActive,
                GuestKey = tenant.GuestKey,
                Saler = tenant.Saler,
                CreationTime = new DateTimeOffset(tenant.CreationTime),
                OpenServices = ObjectMapper.Map<List<OpenService>, List<OpenServiceDto>>(openServices.Where(e => e.TenantId == tenant.Id).ToList())
            };
        }
    }

    public async Task SetActiveAsync(Guid id, SetActiveInput input)
    {
        var tenant = await TenantRepository.FindAsync(id);
        if (tenant == null)
        {
            throw new EntityNotFoundException();
        }

        tenant.IsActive = input.Active;
    }

    public virtual async Task DeleteAsync(Guid id)
    {
        var tenant = await TenantRepository.FindAsync(id);
        if (tenant == null)
        {
            return;
        }

        await TenantRepository.DeleteAsync(tenant);
    }

    public async Task AdjustAmount(AdjustAmountInput input)
    {
        await TenantManager.AdjustAmount(input.TenantId, input.Amount, null, input.Remark);
        await CurrentUnitOfWork.SaveChangesAsync();
    }

    public async Task SetSaler(Guid id, SetSaler input)
    {
        var tenant = await TenantRepository.FindAsync(id);
        if (tenant == null)
        {
            throw new EntityNotFoundException();
        }

        tenant.SetSaler(input.Saler);
    }

    public async Task ExtendOpenServiceDueDate(Guid id, ExtendOpenServiceDueDateInput input)
    {
        if (!WebConfiguration.AuthConfig.OpenServices.Any(e => e.Name == input.Name))
        {
            throw new System.Exception($"服务不存在");
        }

        using (DataFilter.Disable<IMultiTenant>())
        {
            await TenantManager.ExtendOpenServiceDueDate(id, input.Name, new TimeSpan(input.Daynum, 0, 0, 0), 0);
        }
    }
}

public class TenantDtoEx : TenantDto
{
    public string? AdminPhone { get; set; }

    public List<OpenServiceDto> OpenServices { get; set; }
}