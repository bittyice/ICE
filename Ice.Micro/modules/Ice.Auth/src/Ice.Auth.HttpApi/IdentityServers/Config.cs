
using System.Collections.Generic;
using Ice.Utils;
using IdentityServer4.Models;

namespace Ice.Auth.IdentityServers;

public class Config
{
    // 身份资源
    public static IEnumerable<IdentityResource> GetIdentityResources()
    {
        return new List<IdentityResource>
            {
                new IdentityResources.OpenId(),
                new IdentityResources.Profile(),
            };
    }

    // API域（域包裹在资源中，表示一组API）
    // 在jwt中的key为scope
    public static IEnumerable<ApiScope> GetApis()
    {
        return new List<ApiScope>
            {
                new ApiScope(IceResourceScopes.AIScope, "AI Api"),
                new ApiScope(IceResourceScopes.PSIScope, "PSI Api"),
            };
    }

    // API资源（一般一个子系统代表一个资源，但为了方便，这里将整个系统代表一个资源）
    // 在jwt中的key为aud
    public static IEnumerable<ApiResource> GetApiResources()
    {
        // 包含的资源服务器
        return new List<ApiResource>
            {
                new ApiResource(IceResourceScopes.IceResource, "Ice AI Resource")
                {
                    Scopes = { IceResourceScopes.AIScope, IceResourceScopes.PSIScope }
                },
            };
    }

    // 客户端
    public static IEnumerable<Client> GetClients()
    {
        return new List<Client>
        {
        };
    }
}