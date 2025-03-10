using System;
using Volo.Abp.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Volo.Abp.MultiTenancy;
using Volo.Abp;

namespace Ice.Auth.Core;

public class User : IdentityUser<Guid>, IAggregateRoot<Guid>, IMultiTenant
{
    /// <summary>
    /// 
    /// </summary>
    /// <see cref="Ice.Utils.IceRoleTypes" />
    public string Role { get; set; }

    // 微信 OpenID
    public string? WxOpenId { get; protected set; }

    public Guid? TenantId { get; protected set; }

    protected User() { }

    public User(Guid id, string role, Guid? tenantId = null)
    {
        Id = id;
        TenantId = tenantId;
        Role = role;
    }

    public object[] GetKeys()
    {
        return new object[] { Id };
    }

    public void SetWxOpenId(string openId)
    {
        if (!string.IsNullOrEmpty(WxOpenId))
        {
            throw new UserFriendlyException("该用户已绑定微信号，无法重复绑定");
        }
        WxOpenId = openId;
    }
}