
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using Ice.Auth.Core;
using Ice.Auth.Enums;
using Ice.Auth.IdentityServers;
using Ice.Utils;
using IdentityModel;
using IdentityServer4;
using IdentityServer4.Models;
using IdentityServer4.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SKIT.FlurlHttpClient.Wechat.Api;
using SKIT.FlurlHttpClient.Wechat.Api.Models;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Authorization;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Security.Claims;

namespace Ice.Auth;

[ApiController]
[Route("/api/auth/[controller]/[action]")]
public class AccountController : AbpControllerBase
{
    protected const int TokenLifeTime = 72000;

    protected ITokenService TokenService { get; set; }

    protected UserManager<User> UserManager { get; }

    protected IRepository<User> UserRepository { get; set; }

    protected IRepository<Tenant> TenantRepository { get; set; }

    protected IRepository<OpenService> OpenServiceRepository { get; set; }

    protected IRepository<IdentitySecurityLog, Guid> IdentitySecurityLogRepository { get; }

    protected IRepository<GuestBlacklist, Guid> GuestBlacklistRepository { get; }

    protected GuestInfoHelper GuestInfoHelper { get; set; }

    protected IDataFilter DataFilter { get; }

    public AccountController(
        ITokenService tokenService,
        UserManager<User> userManager,
        IRepository<User> userRepository,
        IRepository<Tenant> tenantRepository,
        IRepository<OpenService> openServiceRepository,
        IRepository<IdentitySecurityLog, Guid> identitySecurityLogRepository,
        IRepository<GuestBlacklist, Guid> guestBlacklistRepository,
        GuestInfoHelper loginInfoHelper,
        IDataFilter dataFilter
    )
    {
        TokenService = tokenService;
        UserManager = userManager;
        UserRepository = userRepository;
        TenantRepository = tenantRepository;
        OpenServiceRepository = openServiceRepository;
        IdentitySecurityLogRepository = identitySecurityLogRepository;
        GuestBlacklistRepository = guestBlacklistRepository;
        GuestInfoHelper = loginInfoHelper;
        DataFilter = dataFilter;
    }

    // 登录
    [HttpPost]
    [ActionName("login")]
    public async Task<string> Login([FromBody] LoginInputModel model)
    {
        using (DataFilter.Disable<IMultiTenant>())
        {
            var user = await UserManager.FindByNameAsync(model.Username);
            if (user == null)
            {
                throw new UserFriendlyException("用户名或密码错误");
            }

            if (user.LockoutEnd > DateTime.UtcNow)
            {
                throw new UserFriendlyException("用户已被锁定，请稍等片刻后重试");
            }

            // 验证密码是否正确
            var pass = await UserManager.CheckPasswordAsync(user, model.Password);

            if (!pass)
            {
                await UserManager.AccessFailedAsync(user);
                throw new UserFriendlyException("用户名或密码错误");
            }

            await this.RecordLoginLogsAsync(user);
            var accessTokenValue = await this.CreateAccessToken(user, TokenLifeTime);

            return accessTokenValue;
        }
    }

    // 微信登录
    [HttpPost]
    [ActionName("wx-login")]
    public async Task<string> WxLogin([FromBody] WxLoginInput input)
    {
        var options = new WechatApiClientOptions()
        {
            AppId = WebConfiguration.WxConfig.AppId,
            AppSecret = WebConfiguration.WxConfig.AppSecret
        };
        var client = new WechatApiClient(options);

        var respone = await client.ExecuteSnsOAuth2AccessTokenAsync(new SnsOAuth2AccessTokenRequest()
        {
            Code = input.Code
        });

        if (respone.ErrorCode != 0)
        {
            throw new UserFriendlyException($"错误消息：{respone.ErrorMessage}，错误码：{respone.ErrorCode}");
        }

        using (DataFilter.Disable<IMultiTenant>())
        {
            var user = await UserRepository.FirstOrDefaultAsync(e => e.WxOpenId == respone.OpenId);
            if (user == null)
            {
                throw new UserFriendlyException($"当前微信未绑定任何账号");
            }
            await this.RecordLoginLogsAsync(user);
            var accessTokenValue = await this.CreateAccessToken(user, TokenLifeTime);

            return accessTokenValue;
        }
    }

    // 重新获取 AccessToken
    [HttpPost]
    [ActionName("recreate-access-token")]
    [Authorize(Roles = IceRoleTypes.Admin)]
    public async Task<string> RecreateAccessToken()
    {
        // token 的颁发时间
        var user = await UserManager.FindByIdAsync(CurrentUser.Id.ToString());
        int lifetime = Convert.ToInt32(CurrentUser.FindClaim(JwtClaimTypes.Expiration).Value) - ((int)(DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalSeconds);
        return await this.CreateAccessToken(user, lifetime);
    }

    // 生成 Access Token
    protected async Task<string> CreateAccessToken(User user, int lifetime)
    {
        var claims = new List<Claim>() {
                new Claim(JwtClaimTypes.Subject, user.Id.ToString()),
                new Claim(JwtClaimTypes.Audience, IceResourceScopes.IceResource),
                new Claim(JwtClaimTypes.ClientId, "Ice"),
                new Claim(JwtClaimTypes.AuthenticationMethod, "pwd"),
                new Claim(JwtClaimTypes.Role, user.Role),
            };

        if (user.TenantId != null)
        {
            claims.Add(new Claim(AbpClaimTypes.TenantId, user.TenantId.ToString() ?? ""));

            var openServices = (await OpenServiceRepository.GetListAsync(e => e.TenantId == user.TenantId)).Where(e => e.IsValid());
            foreach (var service in openServices)
            {
                claims.Add(new Claim(JwtClaimTypes.Scope, service.Name));
            }

            // 如果有PSI或者WMS，则允许访问BASE域
            if (openServices.Any(e => e.Name == IceResourceScopes.PSIScope || e.Name == IceResourceScopes.WMSScope))
            {
                claims.Add(new Claim(JwtClaimTypes.Scope, IceResourceScopes.BaseScope));
            }
        }

        var accessToken = new Token(OidcConstants.TokenTypes.AccessToken)
        {
            // 令牌的颁发者（必须是当前 IdentityServer 的地址，否则客户端验证时会失败）
            Issuer = WebConfiguration.ServerUrl,
            Lifetime = lifetime,
            Claims = claims,
            ClientId = "Ice",
            Description = null,
            AccessTokenType = AccessTokenType.Jwt,
            AllowedSigningAlgorithms = null
        };

        return await TokenService.CreateSecurityTokenAsync(accessToken);
    }

    // 获取 GPT 游客 token
    [HttpPost]
    [ActionName("guest-token")]
    public async Task<string> GuestToken(GuestTokenInput input)
    {
        using (DataFilter.Disable<IMultiTenant>())
        {
            var tenant = await TenantRepository.FirstOrDefaultAsync(e => e.GuestKey == input.GuestKey);
            if (tenant == null)
            {
                throw new AbpAuthorizationException();
            }

            string subject = Guid.NewGuid().ToString();

            var claims = new List<Claim>() {
                new Claim(JwtClaimTypes.Subject, subject),
                new Claim(JwtClaimTypes.Audience, IceResourceScopes.IceResource),
                new Claim(JwtClaimTypes.ClientId, "Ice"),
                new Claim(JwtClaimTypes.AuthenticationMethod, "pwd"),
                new Claim(JwtClaimTypes.Role, IceRoleTypes.Guest),
            };

            claims.Add(new Claim(AbpClaimTypes.TenantId, tenant.Id.ToString()));

            var openServices = await OpenServiceRepository.GetListAsync(e => e.TenantId == tenant.Id);
            foreach (var service in openServices)
            {
                claims.Add(new Claim(JwtClaimTypes.Scope, service.Name));
            }

            var accessToken = new Token(OidcConstants.TokenTypes.AccessToken)
            {
                // 令牌的颁发者（必须是当前 IdentityServer 的地址，否则客户端验证时会失败）
                Issuer = WebConfiguration.ServerUrl,
                Lifetime = TokenLifeTime,
                Claims = claims,
                ClientId = "Ice",
                Description = null,
                AccessTokenType = AccessTokenType.Jwt,
                AllowedSigningAlgorithms = null
            };

            var accessTokenValue = await TokenService.CreateSecurityTokenAsync(accessToken);

            LoginInfo loginInfo = new LoginInfo();
            string? ip = this.Request.Headers["X-Forwarded-For"].FirstOrDefault() ?? this.Request.HttpContext.Connection.RemoteIpAddress?.ToString();

            loginInfo.Ip = ip;
            if (!string.IsNullOrEmpty(ip))
            {
                try
                {
                    // http://ip-api.com/json/115.191.200.34?lang=zh-CN
                    var httpClient = new HttpClient();
                    var httpmessage = new HttpRequestMessage(HttpMethod.Get, $"http://ip-api.com/json/{ip}?lang=zh-CN");
                    var response = await httpClient.SendAsync(httpmessage);
                    if (response.IsSuccessStatusCode)
                    {
                        var body = await response.Content.ReadAsStringAsync();
                        var ipResponse = System.Text.Json.JsonSerializer.Deserialize<IpResponse>(body);
                        loginInfo.Province = ipResponse?.regionName;
                        loginInfo.City = ipResponse?.city;
                        loginInfo.Lat = ipResponse?.lat;
                        loginInfo.Lon = ipResponse?.lon;
                    }
                }
                catch { }

                // 检查访客黑名单
                if (await GuestBlacklistRepository.AnyAsync(e => e.Ip == ip))
                {
                    throw new AbpAuthorizationException();
                }
            }

            using (CurrentTenant.Change(tenant.Id))
            {
                await GuestInfoHelper.SetLoginInfo(subject, loginInfo, new TimeSpan(0, 0, TokenLifeTime));
            }

            return accessTokenValue;
        }
    }

    protected async Task RecordLoginLogsAsync(User user)
    {
        await IdentitySecurityLogRepository.InsertAsync(new IdentitySecurityLog(GuidGenerator.Create(), user.TenantId)
        {
            CreationTime = DateTime.Now,
            UserId = user.Id,
            UserName = user.UserName,
        });
    }
}

public class LoginInputModel
{
    [Required]
    public string Username { get; set; }
    [Required]
    public string Password { get; set; }
}

public class GuestTokenInput
{
    [Required]
    public string GuestKey { get; set; }
}

public class WxLoginInput
{
    public string Code { get; set; }
}

public class IpResponse
{
    // success 为请求成功 
    public string? status { get; set; }

    public string? region { get; set; }

    public string? regionName { get; set; }

    public string? city { get; set; }

    public string? timezone { get; set; }

    public double? lat { get; set; }

    public double? lon { get; set; }
};
