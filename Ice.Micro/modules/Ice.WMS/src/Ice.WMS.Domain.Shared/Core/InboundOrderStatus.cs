using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Core
{
    public enum InboundOrderStatus
    {
        /// <summary>
        /// 待收货
        /// </summary>
        PendingReceipt = 101,
        /// <summary>
        /// 验货中
        /// </summary>
        UnderInspection = 102,
        /// <summary>
        /// 上架中
        /// </summary>
        OnTheShelf = 103,
        /// <summary>
        /// 已上架
        /// </summary>
        Shelfed = 104,
        /// <summary>
        /// 作废
        /// </summary>
        Invalid = 999
    }
}
