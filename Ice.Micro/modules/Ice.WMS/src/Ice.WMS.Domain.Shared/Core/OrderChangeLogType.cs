using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Core
{
    public enum OrderChangeLogType
    {
        /// <summary>
        /// 入库单
        /// </summary>
        InboundOrder = 101,
        /// <summary>
        /// 出库单
        /// </summary>
        OutboundOrder = 102,
    }
}
