using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS
{
    public static class WebConfiguration
    {
        /// <summary>
        /// 快递100面单模板
        /// </summary>
        public static Dictionary<string, string> KD100Templetes = new Dictionary<string, string>() {
            // {"annengwuliu", "安能快运"},
            // 德邦快递
            {"debangkuaidi", "60f57a33374f2b0013cf830b"},
            // 德邦物流
            {"debangwuliu", "60f57601f8293500148c026d"},
            // EMS
            {"ems", "60d57ed3c7cbaa001441d45a"},
            // 百世快递
            {"huitongkuaidi", "60cbff8ec7cbaa001441d087"},
            // 百世快运
            {"baishiwuliu", "62d6786abad42f00148dfcf1"},
            // 京东快递
            {"jd", "60acf369f4602900133763fa"},
            // 跨越速运
            {"kuayue", "62df851fc062ae0013c39788"},
            // 品骏快递
            {"pjbest", "6103cb8dab792f00136b0c3a"},
            // 申通快递
            {"shentong", "60d3267f71ec3d00137c8312"},
            // 顺丰
            {"shunfeng", "62cfc4f9cce62b00130f0977"},
            // 顺丰快运
            {"shunfengkuaiyun", "61c016e1c66fb00013a1b1b6"},
            // 丰网速运
            {"fengwang", "60f6cc22f8293500148c02e7"},
            // {"xinfengwuliu", "信丰物流"},
            // {"youshuwuliu", "优速快递"},
            // 邮政快递包裹
            {"youzhengguonei", "61adb9f04cb63500130195bb"},
            // 圆通速递
            {"yuantong", "60d1cbc4c7cbaa001441d1d9"},
            // 圆通国际
            {"yuantongguoji", "60d1cbc4c7cbaa001441d1d9"},
            // 韵达快递
            {"yunda", "60d48922c7cbaa001441d3ab"},
            // 宅急送
            {"zhaijisong", "60f6c17c7c223700131d8bc3"},
            // 中通快递
            {"zhongtong", "6256a96111aeb20013c7f182"},
            // 中通快运
            {"zhongtongkuaiyun", "6256a96111aeb20013c7f182"},
            // EWE全球快递
            {"ewe", "61074e02f21c330013762aa5"},
            // 圆通承诺达
            {"ytchengnuoda", "60d1cbc4c7cbaa001441d1d9"},
            // {"weitepai", "微特派"},
            // {"dsukuaidi", "D速快递"},
            // {"cfss", "银雁专送"},
            // 极兔速递
            {"jtexpress", "60bed56fc7cbaa001402cc5c"},
            // 汇森速运
            {"huisenky", "610393c6ff14a60013320202"},
            // 众邮快递
            {"zhongyouex", "60f6cb27f8293500148c02e5"},
            // 加运美速递
            {"jiayunmeiwuliu", "61b835cf4cb6350013020112"},
            // {"idamalu", "大马鹿"},
            // 顺心捷达
            {"sxjdfreight", "60ffb879374f2b0013cf864e"},
            // {"yimidida", "壹米滴答"},
            // 京东快运
            {"jingdongkuaiyun", "60acf369f4602900133763fa"},
            // 韵达点通达
            {"yundadiantongda", "60d48922c7cbaa001441d3ab"},
            // 速腾快递
            {"suteng", "62b58225dea3b800133ed789"},
            // {"lianhaowuliu", "联昊通速递"},
            // 佳怡物流
            {"jiayiwuliu", "61b80c854cb6350013020093"},
            // {"jinguangsudikuaijian", "京广速递"},
            // 韵达快运
            {"yundakuaiyun", "60d48922c7cbaa001441d3ab"},
            // {"tiandihuayu", "天地华宇"},
            // {"cccc58", "中集冷云"},
            // 哪吒速运
            {"nezhasuyun", "6229fedd612bb60013bdd465"},
            // {"sunjex", "新杰物流"},
            // 默认，顺丰速运
            {"default", "62cfc4f9cce62b00130f0977"},
        };

        public static IceConfig IceConfig = new IceConfig();

        public static void Init(IConfiguration configuration)
        {
            IceConfig.MinPdaVersion = Convert.ToInt32(configuration["WMSConfig:MinPdaVersion"]);
            IceConfig.ExpressOrderFee = Convert.ToInt32(configuration["WMSConfig:ExpressOrderFee"]);
        }
    }

    public class IceConfig
    {
        public int MinPdaVersion { get; set; }
        public int ExpressOrderFee { get; set; }
    }
}
