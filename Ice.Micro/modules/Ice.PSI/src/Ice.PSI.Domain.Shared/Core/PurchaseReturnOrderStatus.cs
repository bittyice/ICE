using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Core
{
    public enum PurchaseReturnOrderStatus
    {
        /// <summary>
        /// 待审核
        /// </summary>
        PendingReview = 101,
        /// <summary>
        /// 退货中
        /// </summary>
        Returning = 102,
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
