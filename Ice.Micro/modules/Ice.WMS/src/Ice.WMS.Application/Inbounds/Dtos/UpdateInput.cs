using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.Inbounds.Dtos
{
    public class UpdateInput
    {
        /// <summary>
        /// 入库批次号
        /// </summary>
        [RegularExpression("^[a-z|A-Z|0-9|_|-]*$", ErrorMessage = "批次号必须是字母或数字或-_组成")]
        public string InboundBatch { get; set; }

        public string ExtraInfo { get; set; }

        public string Remark { get; set; }

        public string OtherInfo { get; set; }

        [MaxLength(length: 100, ErrorMessage = "最多包含100条明细")]
        [MinLength(length: 0, ErrorMessage = "至少包含一条明细")]
        public List<UpdateInboundDetail> InboundDetails { get; set; }

        public class UpdateInboundDetail
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
            [Range(0, 99999999)]
            public int ForecastQuantity { get; set; }

            /// <summary>
            /// 总金额
            /// </summary>
            [Range(0, 99999999)]
            public int TotalAmount { get; set; }

            /// <summary>
            /// 过期时间
            /// </summary>
            public DateTimeOffset? ShelfLise { get; set; }

            /// <summary>
            /// 备注
            /// </summary>
            public string Remark { get; set; }
        }
    }
}
