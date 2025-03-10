using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Core
{
    public class SaleOrderStatus
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
        /// 仓库处理中
        /// </summary>
        public const string Processing = "Processing";

        /// <summary>
        /// 已收货
        /// </summary>
        public const string Completed = "Completed";

        /// <summary>
        /// 驳回
        /// </summary>
        public const string Rejected = "Rejected";
    }
}
