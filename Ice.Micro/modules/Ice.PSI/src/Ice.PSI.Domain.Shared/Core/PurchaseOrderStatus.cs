using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Core
{
    public enum PurchaseOrderStatus
    {
        /// <summary>
        /// 待审核
        /// </summary>
        PendingReview = 101,
        /// <summary>
        /// 采购中
        /// </summary>
        Purchasing = 102,
        /// <summary>
        /// 已完成
        /// </summary>
        Completed = 103,
        /// <summary>
        /// 作废
        /// </summary>
        Invalid = 999
    }
}
