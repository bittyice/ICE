using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Ice.Auth.Core;
using Ice.Auth.Dtos;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Domain.Repositories;

namespace Ice.Auth.Services.Tenants;

[Authorize(Roles = $"{IceRoleTypes.Admin},{IceRoleTypes.Host}")]
public class TenantAppService : AuthAppService
{
    protected IRepository<Tenant, Guid> TenantRepository { get; }

    protected IRepository<Company, Guid> CompanyRepository { get; }

    public TenantAppService(
        IRepository<Tenant, Guid> tenantRepository,
        IRepository<Company, Guid> companyRepository)
    {
        TenantRepository = tenantRepository;
        CompanyRepository = companyRepository;
    }

    // 获取当前租户
    public async Task<TenantDto?> GetAsync()
    {
        if (!CurrentTenant.Id.HasValue)
        {
            return null;
        }
        var entity = await TenantRepository.GetAsync(CurrentTenant.Id.Value);
        return ObjectMapper.Map<Tenant, TenantDto>(entity);
    }

    // 重新设置访客Key
    public async Task ResetGuestKeyAsync()
    {
        if (!CurrentTenant.Id.HasValue)
        {
            return;
        }
        var entity = await TenantRepository.GetAsync(CurrentTenant.Id.Value);
        entity.ResetGuestKey();
    }

    /// <summary>
    /// 获取当前公司信息
    /// </summary>
    /// <returns></returns>
    public async Task<CompanyDto> GetCompany()
    {
        Company company = await CompanyRepository.FirstOrDefaultAsync();

        return ObjectMapper.Map<Company, CompanyDto>(company);
    }

    /// <summary>
    /// 设置当前公司信息
    /// </summary>
    /// <returns></returns>
    public async Task SetCompany(SetCompanyInput input)
    {
        Company company = await CompanyRepository.FirstOrDefaultAsync();

        if (company == null)
        {
            company = new Company(input.Name);
            await CompanyRepository.InsertAsync(company);
        }

        company.Name = input.Name;
        company.Contact = input.Contact;
        company.Phone = input.Phone;
        company.Province = input.Province;
        company.City = input.City;
        company.Town = input.Town;
        company.Street = input.Street;
        company.Postcode = input.Postcode;
        company.AddressDetail = input.AddressDetail;
        company.ExtraInfo = input.ExtraInfo;
        company.TenantId = CurrentTenant.Id;
    }
}