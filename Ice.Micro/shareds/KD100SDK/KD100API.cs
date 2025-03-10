using KD100SDK.Common;
using KD100SDK.Common.Request;
using KD100SDK.Common.Request.Electronic;
using KD100SDK.Common.Request.Label;
using KD100SDK.Common.Request.thirdPlatform;
using KD100SDK.Core;
using KD100SDK.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KD100SDK
{
    public class KD100API
    {
        //快递100的基础账号信息，可以在这里获取 (需要填写完整才能测试)
        //https://api.kuaidi100.com/manager/v2/myinfo/enterprise
        private static KuaiDi100Config config = new KuaiDi100Config()
        {
            key = "AdoWNzXT9408",
            customer = "8D48716FFD796B4FD200FFB0171C7B06",
            secret = "44c326a0581f4c228cbdb51afda0d310",
            userid = "a69e027db04347429443ff6501d6b2e3",
            siid = "",
            tid = "",
        };

        /// <summary>
        /// 获取店铺授权超链接接口
        /// </summary>
        public BaseRespone<StoreAuthRespone> ThirdPlatformStoreAuth(StoreAuthParam param)
        {
            BaseReq<StoreAuthParam> baseReq = new BaseReq<StoreAuthParam>()
            {
                key = config.key,
                sign = SignUtils.GetMD5(param.ToString() + config.key + config.secret),
                param = param
            };
            return ThirdPlatformOrder.auth(baseReq);
        }

        /// <summary>
        /// 拉取订单
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        public BaseRespone<CommitTaskRespone> ThirdPlatformCommitTask(CommitTaskParam param)
        {
            BaseReq<CommitTaskParam> baseReq = new BaseReq<CommitTaskParam>()
            {
                key = config.key,
                sign = SignUtils.GetMD5(param.ToString() + config.key + config.secret),
                param = param
            };
            return ThirdPlatformOrder.commitTask(baseReq);
        }

        /// <summary>
        /// 电子面单V2打印接口
        /// </summary>
        public BaseRespone<LabelOrderRespone> LabelOrder(OrderParam param)
        {
            var timestamp = DateUtils.GetTimestamp();
            return LabelV2.order(new BaseReq<OrderParam>()
            {
                method = ApiInfoConstant.ORDER,
                key = config.key,
                t = timestamp,
                sign = SignUtils.GetMD5(param.ToString() + timestamp + config.key + config.secret),
                param = param,
            });
        }

        public CommonRespone LabelCancel(CancelPrintParam param)
        {
            var timestamp = DateUtils.GetTimestamp();
            BaseReq<CancelPrintParam> baseReq = new BaseReq<CancelPrintParam>()
            {
                key = config.key,
                t = timestamp,
                sign = SignUtils.GetMD5(param.ToString() + timestamp + config.key + config.secret),
                param = param
            };
            return PrintCloud.cancel(baseReq);
        }
    }
}
