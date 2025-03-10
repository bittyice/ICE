using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Core
{
    public static class OuterOrderStatus
    {
        /// <summary>
        /// 待处理
        /// </summary>
        public const string Processing = "Processing";

        /// <summary>
        /// 出库中
        /// </summary>
        public const string OutStocking = "OutStocking";

        /// <summary>
        /// 已出库
        /// </summary>
        public const string OutStocked = "OutStocked";
    }
}
