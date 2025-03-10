using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Core
{
    public enum PickListStatus
    {
        /// <summary>
        /// 拣货中
        /// </summary>
        Picking = 102,
        /// <summary>
        /// 完成
        /// </summary>
        Complete = 104,
        /// <summary>
        /// 作废
        /// </summary>
        Invalid = 999
    }
}
