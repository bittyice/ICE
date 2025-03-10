using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class Delivery100ExpressOrderDto
    {
        /// <summary>
        /// 快递公司编码
        /// </summary>
        public string ShipperCode { get; set; }

        /// <summary>
        /// 快递单号
        /// </summary>
        public string ExpressNumber { get; set; }

        /// <summary>
        /// 订单号
        /// </summary>
        public string OrderNumber { get; set; }

        /// <summary>
        /// 打印模板
        /// </summary>
        public string PrintTemplate { get; set; }

        /// <summary>
        /// 第三方信息
        /// </summary>
        public string TPInfo { get; set; }
    }
}
