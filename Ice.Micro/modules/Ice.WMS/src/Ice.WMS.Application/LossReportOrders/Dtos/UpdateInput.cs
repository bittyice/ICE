using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.LossReportOrders.Dtos
{
    public class UpdateInput
    {
        public string ExtraInfo { get; set; }

        public List<UpdateLossReportDetail> Details { get; set; }

        public class UpdateLossReportDetail
        {
            /// <summary>
            /// SKU
            /// </summary>
            [Required]
            public string Sku { get; set; }

            /// <summary>
            /// 数量
            /// </summary>
            [Required]
            [Range(0, 999999)]
            public int Quantity { get; set; }
        }
    }
}
