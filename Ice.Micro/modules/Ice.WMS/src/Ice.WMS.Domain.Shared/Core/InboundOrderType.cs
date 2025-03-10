using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Core
{
    public enum InboundOrderType
    {
        /// <summary>
        /// 采购
        /// </summary>
        Purchase = 101,
        /// <summary>
        /// 门店退货
        /// </summary>
        SaleReturn = 102,
        /// <summary>
        /// 调拨
        /// </summary>
        Transfer = 103,
        /// <summary>
        /// 自定义
        /// </summary>
        Customize = 999,
    }
}
