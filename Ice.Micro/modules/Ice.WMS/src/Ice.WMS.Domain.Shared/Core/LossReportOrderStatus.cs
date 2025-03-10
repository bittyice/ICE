using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Core
{
    public enum LossReportOrderStatus
    {
        /// <summary>
        /// 待处理
        /// </summary>
        ToBeProcessed = 101,
        /// <summary>
        /// 已处理
        /// </summary>
        Processed = 102,
        /// <summary>
        /// 作废
        /// </summary>
        Invalid = 999
    }
}
