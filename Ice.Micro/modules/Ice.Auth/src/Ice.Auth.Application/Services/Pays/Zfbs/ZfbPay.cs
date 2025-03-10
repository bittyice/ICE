using Aop.Api.Request;
using Aop.Api.Response;
using Newtonsoft.Json;
using Volo.Abp.DependencyInjection;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using Volo.Abp;
using Aop.Api.Util;

namespace Ice.Auth.Services.Pays;

public class ZfbPay : ITransientDependency
{
    public const string ServerUrl = "https://openapi.alipay.com/gateway.do";
    public const string AppId = "*";
    public const string AppPrivateKey = "*";
    public const string AlipayPublicKey = "*";
    public const string NotifyUrl = "https://www.bittyice.cn/api/auth/zfb-pay/notify";
    public const string EncyptKey = "*";

    protected ILogger<ZfbPay> Logger { get; set; }

    public ZfbPay(
        ILogger<ZfbPay> logger
    )
    {
        Logger = logger;
    }

    public Aop.Api.IAopClient GetClient() => new Aop.Api.DefaultAopClient(
            ServerUrl,
            // app id
            AppId,
            // 应用私钥
            AppPrivateKey,
            "json",
            "1.0",
            "RSA2",
            // 阿里公钥
            AlipayPublicKey,
            "utf-8",
            // 接口内容加密 key
            false);

    public string Create(string orderNumber, double price)
    {
        Aop.Api.IAopClient client = GetClient();

        AlipayTradePagePayRequest request = new AlipayTradePagePayRequest();
        //异步接收地址，仅支持http/https，公网可访问
        request.SetNotifyUrl(NotifyUrl);
        // //同步跳转地址，仅支持http/https
        // request.SetReturnUrl("");

        /******必传参数******/
        Dictionary<string, object> bizContent = new Dictionary<string, object>();
        //商户订单号，商家自定义，保持唯一性
        bizContent.Add("out_trade_no", orderNumber);
        //支付金额，最小值0.01元
        bizContent.Add("total_amount", price);
        //订单标题，不可使用特殊符号
        bizContent.Add("subject", "账户充值");
        //电脑网站支付场景固定传值FAST_INSTANT_TRADE_PAY
        bizContent.Add("product_code", "FAST_INSTANT_TRADE_PAY");
        bizContent.Add("qr_pay_mode", "4");
        bizContent.Add("qrcode_width", 150);

        /******可选参数******/
        //bizContent.Add("time_expire", "2022-08-01 22:00:00");

        ////商品明细信息，按需传入
        //List<object> goodsDetails = new List<object>();
        //Dictionary<string, object> goods1 = new Dictionary<string, object>();
        //goods1.Add("goods_id", "goodsNo1");
        //goods1.Add("goods_name", "子商品1");
        //goods1.Add("quantity", 1);
        //goods1.Add("price", 0.01);
        //goodsDetails.Add(goods1);
        //bizContent.Add("goods_detail", goodsDetails);

        ////扩展信息，按需传入
        //Dictionary<string, object> extendParams = new Dictionary<string, object>();
        //extendParams.Add("sys_service_provider_id", "2088501624560335");
        //bizContent.Add("extend_params", extendParams);

        string Contentjson = JsonConvert.SerializeObject(bizContent);
        request.BizContent = Contentjson;
        AlipayTradePagePayResponse response = client.pageExecute(request);
        if (response.IsError)
        {
            throw new UserFriendlyException(response.Msg);
        }
        return response.Body;
    }

    public AlipayTradeQueryResponse? Query(string orderNumber)
    {
        Aop.Api.IAopClient client = GetClient();

        AlipayTradeQueryRequest request = new AlipayTradeQueryRequest();
        request.BizContent = "{" +
        "  \"out_trade_no\":\"" + orderNumber + "\"," +
        "  \"query_options\":[" +
        "    \"trade_settle_info\"" +
        "  ]" +
        "}";
        AlipayTradeQueryResponse response = client.Execute(request);
        if (response.IsError)
        {
            // 可能订单没有扫描过，支付宝那边不生成订单
            if(response.SubCode == "ACQ.TRADE_NOT_EXIST") {
                return null;
            }
            throw new UserFriendlyException(response.SubMsg);
        }
        return response;
    }

    public void Close(string orderNumber)
    {
        Aop.Api.IAopClient client = GetClient();

        AlipayTradeCloseRequest request = new AlipayTradeCloseRequest();
        Dictionary<string, object> bizContent = new Dictionary<string, object>();
        bizContent.Add("out_trade_no", orderNumber);
        string Contentjson = JsonConvert.SerializeObject(bizContent);
        request.BizContent = Contentjson;
        AlipayTradeCloseResponse response = client.Execute(request);
        if (response.IsError)
        {
            // 可能订单没有扫描过，支付宝那边不生成订单
            if(response.SubCode == "ACQ.TRADE_NOT_EXIST") {
                return;
            }
            throw new UserFriendlyException(response.SubMsg);
        }
        Logger.LogInformation($"支付宝订单 ${orderNumber} 已取消");
    }

    public bool RSACheck(Dictionary<string, string> sArray)
    {
        return AlipaySignature.RSACheckV1(sArray, AlipayPublicKey, "utf-8", "RSA2", false);
    }
}

public class ResponseBase
{
    public string code { get; set; }
    public string msg { get; set; }
    public string sub_code { get; set; }
    public string sub_msg { get; set; }
    public string sign { get; set; }
}