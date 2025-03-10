
using System;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace Ice.Auth;

public static class WebConfiguration
{
    public static WxConfig WxConfig = new WxConfig();

    public static AuthConfig AuthConfig = new AuthConfig();

    public static string ServerUrl = "";

    public static void Init(IConfiguration configuration)
    {
        WxConfig.AppId = configuration["WxConfig:AppId"];
        WxConfig.AppSecret = configuration["WxConfig:AppSecret"];
        WxConfig.AppToken = configuration["WxConfig:AppToken"];
        WxConfig.MerchantId = configuration["WxConfig:MerchantId"];
        WxConfig.SecretV3 = configuration["WxConfig:SecretV3"];
        WxConfig.CertSerialNumber = configuration["WxConfig:CertSerialNumber"];
        WxConfig.CertPrivateKey = configuration["WxConfig:CertPrivateKey"];
        WxConfig.NotifyUrl = configuration["WxConfig:NotifyUrl"];

        AuthConfig.OpenServices = new List<AllowOpenService>();
        var openServicesSection = configuration.GetSection("AuthConfig:OpenServices").GetChildren();
        foreach (var item in openServicesSection)
        {
            AuthConfig.OpenServices.Add(new AllowOpenService()
            {
                Key = item.GetValue<string>("Key"),
                Name = item.GetValue<string>("Name"),
                Fee = item.GetValue<int>("Fee"),
                Daynum = item.GetValue<int>("Daynum"),
                Base = item.GetValue<string?>("Base"),
            });
        }

        AuthConfig.GiveOpenServices = new List<GiveOpenService>();
        var giveOpenServicesSection = configuration.GetSection("AuthConfig:GiveOpenServices").GetChildren();
        foreach (var item in giveOpenServicesSection)
        {
            AuthConfig.GiveOpenServices.Add(new GiveOpenService()
            {
                Name = item.GetValue<string>("Name"),
                Daynum = item.GetValue<int>("Daynum"),
            });
        }

        ServerUrl = configuration["ServerUrl"];
    }
}

public class WxConfig
{
    public string AppId { get; set; }

    public string AppSecret { get; set; }

    public string AppToken { get; set; }

    public string MerchantId { get; set; }

    public string SecretV3 { get; set; }

    public string CertSerialNumber { get; set; }

    public string CertPrivateKey { get; set; }

    public string NotifyUrl { get; set; }
}

public class AuthConfig
{
    public List<AllowOpenService> OpenServices { get; set; }

    public List<GiveOpenService> GiveOpenServices { get; set; }
}

public class AllowOpenService
{
    public string Key { get; set; }

    public string Name { get; set; }

    public int Fee { get; set; }

    public int Daynum { get; set; }

    public string? Base { get; set; }
}

public class GiveOpenService
{
    public string Name { get; set; }

    public int Daynum { get; set; }
}