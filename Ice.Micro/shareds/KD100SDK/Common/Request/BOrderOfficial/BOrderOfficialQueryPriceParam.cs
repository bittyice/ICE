using Newtonsoft.Json;

namespace KD100SDK.Common.Request.BorderOfficial
{
    public class BOrderOfficialQueryPriceParam {
        /// <summary>
        /// 快递公司编码
        /// </summary>
        public string kuaidiCom {get; set;}
        /// <summary>
        /// 出发地地址，最小颗粒到市级，例如：广东省深圳市
        /// </summary>
        public string sendManPrintAddr {get; set;}
        /// <summary>
        /// 目的地地址，最小颗粒到市级，例如：广东省深圳市
        /// </summary>
        public string recManPrintAddr {get; set;}  
        /// <summary>
        /// 重量
        /// </summary>
        public string weight {get; set;}
        /// <summary>
        /// 业务类型
        /// </summary>
        public string serviceType {get; set;}

        public override string ToString()
        {
            return JsonConvert.SerializeObject(this,Formatting.Indented,new JsonSerializerSettings(){NullValueHandling = NullValueHandling.Ignore});
        }
    }
}