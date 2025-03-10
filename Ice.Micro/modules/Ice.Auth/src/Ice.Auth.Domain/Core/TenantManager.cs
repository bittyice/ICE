using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ice.Auth.Enums;
using Ice.Utils;
using Microsoft.AspNetCore.Identity;
using Volo.Abp;
using Volo.Abp.Data;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Guids;
using Volo.Abp.MultiTenancy;

namespace Ice.Auth.Core;

public class TenantManager : DomainService
{
    protected IRepository<Tenant, Guid> TenantRepository { get; }

    protected IRepository<User, Guid> IceUserRepository { get; }

    protected IRepository<AmountAdjust, Guid> AmountAdjustRepository { get; }

    protected IRepository<OpenService> OpenServiceRepository { get; set; }

    protected UserManager<User> UserManager { get; }

    protected IDataFilter DataFilter { get; }

    public TenantManager(
        IRepository<Tenant, Guid> tenantRepository,
        IRepository<User, Guid> iceUserRepository,
        IRepository<AmountAdjust, Guid> amountAdjustRepository,
        IRepository<OpenService> openServiceRepository,
        UserManager<User> userManager,
        IDataFilter dataFilter)
    {
        TenantRepository = tenantRepository;
        IceUserRepository = iceUserRepository;
        AmountAdjustRepository = amountAdjustRepository;
        OpenServiceRepository = openServiceRepository;
        UserManager = userManager;
        DataFilter = dataFilter;
    }

    public async Task<Tenant> CreateAsync(string phone, string password)
    {
        // 注意，这里 TenantRepository 和 UserManager 的事务不相通
        var tenant = new Tenant();
        await TenantRepository.InsertAsync(tenant);

        using (DataFilter.Disable<IMultiTenant>())
        {
            // UserValidator
            var identityUser = new User(GuidGenerator.Create(), IceRoleTypes.Admin, tenant.Id)
            {
                UserName = phone,
                PhoneNumber = phone
            };
            var result = await UserManager.CreateAsync(identityUser, password);
            result.CheckResult();
        }
        return tenant;
    }

    public async Task AdjustAmount(
        Guid tenantId,
        int amount,
        string? outerNumber,
        string? remark)
    {
        var tenant = await TenantRepository.FindAsync(tenantId);
        if (tenant == null)
        {
            throw new EntityNotFoundException();
        }

        var amountAdjust = new AmountAdjust(tenant.Amount, AmountAdjustType.Customize, amount - tenant.Amount, outerNumber, remark, tenant.Id);
        await AmountAdjustRepository.InsertAsync(amountAdjust);

        tenant.AdjustAmount(amount);
    }

    public async Task Cost(
        Guid tenantId,
        int fee,
        string? outerNumber,
        string? remark)
    {
        var tenant = await TenantRepository.FindAsync(tenantId);
        if (tenant == null)
        {
            throw new EntityNotFoundException();
        }

        var amountAdjust = new AmountAdjust(tenant.Amount, AmountAdjustType.Deduct, fee, outerNumber, remark, tenant.Id);
        await AmountAdjustRepository.InsertAsync(amountAdjust);

        tenant.Cost(fee);
    }

    public async Task SystemDeduct(
        Guid tenantId,
        int fee,
        string? remark
    )
    {
        var tenant = await TenantRepository.FindAsync(tenantId);
        if (tenant == null)
        {
            throw new EntityNotFoundException();
        }

        var amountAdjust = new AmountAdjust(tenant.Amount, AmountAdjustType.Deduct, fee, null, remark, tenant.Id);
        await AmountAdjustRepository.InsertAsync(amountAdjust);

        tenant.SystemDeduct(fee);
    }

    public async Task Recharge(
        Guid tenantId,
        int fee,
        string? outerNumber,
        string? remark
    )
    {
        var tenant = await TenantRepository.FindAsync(tenantId);
        if (tenant == null)
        {
            throw new EntityNotFoundException();
        }

        if (!string.IsNullOrEmpty(outerNumber))
        {
            using (DataFilter.Disable<IMultiTenant>())
            {
                // 订单已处理过
                if (await AmountAdjustRepository.AnyAsync(e => e.OuterNumber == outerNumber && e.Type == Ice.Auth.Enums.AmountAdjustType.Renewal))
                {
                    return;
                }
            }
        }

        var amountAdjust = new AmountAdjust(tenant.Amount, AmountAdjustType.Renewal, fee, outerNumber, remark, tenant.Id);
        await AmountAdjustRepository.InsertAsync(amountAdjust);

        tenant.Recharge(fee);
    }

    // 延长服务时间
    public async Task ExtendOpenServiceDueDate(Guid tenantId, string name, TimeSpan timeSpan, int fee)
    {
        var tenant = await TenantRepository.FindAsync(tenantId);
        if (tenant == null)
        {
            throw new EntityNotFoundException();
        }

        // 扣费
        var amountAdjust = new AmountAdjust(tenant.Amount, AmountAdjustType.Deduct, fee, null, $"开通服务{name}", tenant.Id);
        await AmountAdjustRepository.InsertAsync(amountAdjust);

        tenant.Cost(fee);

        // 延长服务时间
        var openService = await this.OpenServiceRepository.FirstOrDefaultAsync(e => e.Name == name && e.TenantId == tenantId);
        if (openService == null)
        {
            openService = new OpenService(GuidGenerator.Create(), name, DateTime.Now, tenant.Id);
            await this.OpenServiceRepository.InsertAsync(openService);
        }

        openService.ExtendDueDate(timeSpan);
    }
}
