
using System;
using System.Threading.Tasks;
using Ice.Auth.Core;
using Ice.Auth.Services.Wxs;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using SKIT.FlurlHttpClient.Wechat.Api;
using SKIT.FlurlHttpClient.Wechat.Api.Models;
using Volo.Abp;
using Volo.Abp.Caching;
using Volo.Abp.Domain.Repositories;

namespace Ice.Auth;

[Authorize(Roles = IceRoleTypes.Admin)]
public class WxAppService : AuthAppService
{
    protected IRepository<User, Guid> UserRepository { get; }

    public WxAppService(
        IRepository<User, Guid> userRepository)
    {
        UserRepository = userRepository;
    }

    [HttpPost]
    public async Task BindUserAsync(BindUserInput input)
    {
        var respone = await GetAccessToken(input.Code);
        if (respone == null)
        {
            throw new Exception("微信绑定异常");
        }
        var user = await UserRepository.FindAsync(e => e.Id == CurrentUser.Id);
        user.SetWxOpenId(respone.OpenId);
    }

    /// <summary>
    /// 获取微信用户Token
    /// </summary>
    /// <param name="code"></param>
    /// <returns></returns>
    /// <exception cref="UserFriendlyException"></exception>
    protected async Task<SnsOAuth2AccessTokenResponse> GetAccessToken(string code)
    {
        var options = new WechatApiClientOptions()
        {
            AppId = WebConfiguration.WxConfig.AppId,
            AppSecret = WebConfiguration.WxConfig.AppSecret
        };
        var client = new WechatApiClient(options);

        var respone = await client.ExecuteSnsOAuth2AccessTokenAsync(new SnsOAuth2AccessTokenRequest()
        {
            Code = code
        });

        if (respone.ErrorCode != 0)
        {
            throw new UserFriendlyException($"错误消息：{respone.ErrorMessage}，错误码：{respone.ErrorCode}");
        }

        return respone;
    }
}
