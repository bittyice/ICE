using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Core
{
    /// <summary>
    /// 出库单状态
    /// </summary>
    public static class OutboundOrderStatus
    {
        /// <summary>
        /// 待审核
        /// </summary>
        public const string PendingReview = "PendingReview";

        /// <summary>
        /// 作业中
        /// </summary>
        public const string Working = "Working";

        /// <summary>
        /// 已出库
        /// </summary>
        public const string OutStocked = "OutStocked";

        /// <summary>
        /// 作废
        /// </summary>
        public const string Invalid = "Invalid";
    }
}
