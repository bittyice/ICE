using Ice.WMS.Core;
using Ice.WMS.Core.InboundOrders;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.LossReportOrders.Dtos
{
    public class CreateInput
    {
        /// <summary>
        /// 入库单号
        /// </summary>
        [Required]
        [RegularExpression("^[a-z|A-Z|0-9]{6,}$", ErrorMessage = "报损单号必须是6位以上的字符或数字")]
        public string OrderNumber { get; set; }

        /// <summary>
        /// 仓库
        /// </summary>
        [Required]
        public Guid WarehouseId { get; set; }

        public string ExtraInfo { get; set; }

        public List<CreateLossReportDetail> Details { get; set; }

        public class CreateLossReportDetail
        {
            /// <summary>
            /// SKU
            /// </summary>
            [Required]
            public string Sku { get; set; }

            /// <summary>
            /// 预报数量
            /// </summary>
            [Required]
            [Range(0, 999999)]
            public int Quantity { get; set; }
        }
    }
}
