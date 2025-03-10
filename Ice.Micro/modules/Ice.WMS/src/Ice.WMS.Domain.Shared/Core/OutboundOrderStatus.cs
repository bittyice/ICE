using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Core
{
    public enum OutboundOrderStatus
    {
        /// <summary>
        /// 待拣货
        /// </summary>
        ToBePicked = 101,
        /// <summary>
        /// 拣货中
        /// </summary>
        Picking = 102,
        /// <summary>
        /// 待出库
        /// </summary>
        TobeOut = 104,
        /// <summary>
        /// 已出库
        /// </summary>
        Outofstock = 105,
        /// <summary>
        /// 作废
        /// </summary>
        Invalid = 999
    }
}
