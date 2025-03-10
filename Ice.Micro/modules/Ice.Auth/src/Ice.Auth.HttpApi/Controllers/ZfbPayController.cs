
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Ice.Auth.Services;
using Ice.Auth.Services.Pays;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Volo.Abp.AspNetCore.Mvc;

namespace Ice.Auth;

[Route("api/auth/zfb-pay/[Action]")]
public class ZfbPayController : AbpControllerBase
{
    protected ZfbPayAppService PayAppService { get; }

    public ZfbPayController(
        ZfbPayAppService payAppService)
    {
        PayAppService = payAppService;
    }

    /// <summary>
    /// 微信通知接口, 给微信使用的
    /// </summary>
    /// <returns></returns>
    [HttpPost]
    [ActionName("notify")]
    public async Task<string> Notify()
    {
        Logger.LogInformation("收到支付宝通知");
        var requireparams = GetRequestPost();
        Logger.LogInformation(System.Text.Json.JsonSerializer.Serialize(requireparams));
        return await PayAppService.Notify(requireparams);
    }

    protected Dictionary<string, string> GetRequestPost()
    {
        Dictionary<string, string> sArray = new Dictionary<string, string>();
        foreach(var item in HttpContext.Request.Form) {
            sArray.Add(item.Key, item.Value);
        }
        return sArray;

    }
}