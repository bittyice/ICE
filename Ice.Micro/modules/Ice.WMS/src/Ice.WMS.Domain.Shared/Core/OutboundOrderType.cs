using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Core
{
    public class OutboundOrderType {
        /// <summary>
        /// 调拨单
        /// </summary>
        public const string Transfer = "Transfer";

        /// <summary>
        /// 门店订单
        /// </summary>
        public const string Sale = "Sale";

        /// <summary>
        /// 采购退货
        /// </summary>
        public const string PurchaseReturn = "PurchaseReturn";

        /// <summary>
        /// 自定义
        /// </summary>
        public const string Customize = "Customize";
    }
}
