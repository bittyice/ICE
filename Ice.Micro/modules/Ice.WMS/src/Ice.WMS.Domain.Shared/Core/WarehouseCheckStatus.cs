using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Core
{
    public enum WarehouseCheckStatus
    {
        /// <summary>
        /// 待盘点
        /// </summary>
        Waiting = 101,
        /// <summary>
        /// 盘点中
        /// </summary>
        Checking = 102,
        /// <summary>
        /// 已盘点
        /// </summary>
        Checked = 103,
        /// <summary>
        /// 作废
        /// </summary>
        Invalid = 999
    }
}
