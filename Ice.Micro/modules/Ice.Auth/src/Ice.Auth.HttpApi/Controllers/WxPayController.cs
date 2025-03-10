
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Ice.Auth.Services;
using Ice.Auth.Services.Pays;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;

namespace Ice.Auth;

[Route("api/auth/wx-pay/[Action]")]
public class WxPayController : AbpControllerBase
{
    protected WxPayAppService WxPayAppService { get; }

    public WxPayController(
        WxPayAppService wxPayAppService)
    {
        WxPayAppService = wxPayAppService;
    }

    /// <summary>
    /// 微信通知接口, 给微信使用的
    /// </summary>
    /// <returns></returns>
    [HttpPost]
    [ActionName("notify")]
    public async Task<object> Notify(
        [FromHeader(Name = "Wechatpay-Timestamp")] string? timestamp,
        [FromHeader(Name = "Wechatpay-Nonce")] string? nonce,
        [FromHeader(Name = "Wechatpay-Signature")] string? signature,
        [FromHeader(Name = "Wechatpay-Serial")] string? serialNumber)
    {
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        string body = await reader.ReadToEndAsync();

        var success = await WxPayAppService.Notify(timestamp, nonce, signature, serialNumber, body);

        return success ? new JsonResult(new { code = "SUCCESS", message = "成功" }) : new JsonResult(new { code = "FAIL", message = "失败" });
    }
}