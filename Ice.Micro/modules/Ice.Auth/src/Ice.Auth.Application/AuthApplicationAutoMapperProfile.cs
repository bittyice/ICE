using System;
using AutoMapper;
using Ice.Auth.Core;
using Ice.Auth.Dtos;

namespace Ice.Auth;

public class AuthApplicationAutoMapperProfile : Profile
{
    public AuthApplicationAutoMapperProfile()
    {
        /* You can configure your AutoMapper mapping configuration here.
         * Alternatively, you can split your mapping configurations
         * into multiple profile classes for a better organization. */
        CreateMap<User, UserDto>();
        CreateMap<Tenant, TenantDto>();
        CreateMap<AmountAdjust, AmountAdjustDto>();
        CreateMap<PayOrder, PayOrderDto>();
        CreateMap<OpenService, OpenServiceDto>();
        CreateMap<IdentitySecurityLog, IdentitySecurityLogDto>();
        CreateMap<Company, CompanyDto>();
        CreateMap<GuestBlacklist, GuestBlacklistDto>();
    }
}
