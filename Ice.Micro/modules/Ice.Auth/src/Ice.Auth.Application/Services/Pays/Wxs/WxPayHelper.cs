
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SKIT.FlurlHttpClient.Wechat.TenpayV3;
using SKIT.FlurlHttpClient.Wechat.TenpayV3.Models;
using SKIT.FlurlHttpClient.Wechat.TenpayV3.Settings;
using Volo.Abp.DependencyInjection;

namespace Ice.Auth.Services.Pays;

public class WxPayHelper : ITransientDependency
{
    /// <summary>
    /// 平台证书，用于验证微信发送过来的数据
    /// </summary>
    static List<CertificateEntry> _CertificateEntry { get; set; } = new List<CertificateEntry>();

    public WxPayHelper()
    {
    }

    /// <summary>
    /// 刷新腾讯支付证书
    /// </summary>
    /// <returns></returns>
    public static async Task FetchPayCertificate()
    {
        const string ALGORITHM_TYPE = "RSA";
        var manager = new InMemoryCertificateManager();
        var options = new WechatTenpayClientOptions()
        {
            MerchantId = WebConfiguration.WxConfig.MerchantId,
            MerchantV3Secret = WebConfiguration.WxConfig.SecretV3,
            MerchantCertificateSerialNumber = WebConfiguration.WxConfig.CertSerialNumber,
            MerchantCertificatePrivateKey = WebConfiguration.WxConfig.CertPrivateKey,
            PlatformCertificateManager = manager // 证书管理器的具体用法请参阅下文的高级技巧与加密、验签有关的章节
        };
        var WxClient = new WechatTenpayClient(options);
        var response = await WxClient.ExecuteQueryCertificatesAsync(new QueryCertificatesRequest()
        {
            AlgorithmType = ALGORITHM_TYPE
        });
        if (response.IsSuccessful())
        {
            // 解密响应
            response = WxClient.DecryptResponseSensitiveProperty(response);
            // 存放证书
            _CertificateEntry = new List<CertificateEntry>();
            foreach (var certificate in response.CertificateList)
            {
                _CertificateEntry.Add(new CertificateEntry(ALGORITHM_TYPE, certificate));
            }
        }
    }

    /// <summary>
    /// 微信客户端
    /// </summary>
    /// <returns></returns>
    public WechatTenpayClient GetWechatTenpayClient()
    {
        var manager = new InMemoryCertificateManager();
        foreach (var item in _CertificateEntry)
        {
            manager.AddEntry(item);
        }
        var options = new WechatTenpayClientOptions()
        {
            MerchantId = WebConfiguration.WxConfig.MerchantId,
            MerchantV3Secret = WebConfiguration.WxConfig.SecretV3,
            MerchantCertificateSerialNumber = WebConfiguration.WxConfig.CertSerialNumber,
            MerchantCertificatePrivateKey = WebConfiguration.WxConfig.CertPrivateKey,
            PlatformCertificateManager = manager // 证书管理器的具体用法请参阅下文的高级技巧与加密、验签有关的章节
        };
        return new WechatTenpayClient(options);
    }
}