using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Core
{
    public class SaleReturnOrderStatus
    {
        /// <summary>
        /// 待确认
        /// </summary>
        public const string WaitConfirm = "WaitConfirm";

        /// <summary>
        /// 待处理
        /// </summary>
        public const string ToBeProcessed = "ToBeProcessed";

        /// <summary>
        /// 退货中
        /// </summary>
        public const string Returning = "Returning";

        /// <summary>
        /// 已完成
        /// </summary>
        public const string Completed = "Completed";

        /// <summary>
        /// 驳回
        /// </summary>
        public const string Rejected = "Rejected";
    }
}
