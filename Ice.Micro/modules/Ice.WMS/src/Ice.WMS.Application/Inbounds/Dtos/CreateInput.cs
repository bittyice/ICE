using Ice.WMS.Core;
using Ice.WMS.Core.InboundOrders;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.Inbounds.Dtos
{
    public class CreateInput
    {
        /// <summary>
        /// 入库单号
        /// </summary>
        [RegularExpression("^[a-z|A-Z|0-9]{6,}$", ErrorMessage = "入库单号必须是6位以上的字符或数字")]
        public string InboundNumber { get; set; }

        /// <summary>
        /// 入库单类型
        /// </summary>
        [Required]
        public InboundOrderType Type { get; set; }

        /// <summary>
        /// 入库批次号
        /// </summary>
        [RegularExpression("^[a-z|A-Z|0-9|_|-]*$", ErrorMessage = "批次号必须是字母或数字或-_组成")]
        public string InboundBatch { get; set; }

        /// <summary>
        /// 仓库
        /// </summary>
        [Required]
        public Guid WarehouseId { get; set; }

        public string ExtraInfo { get; set; }

        public string Remark { get; set; }

        public string OtherInfo { get; set; }

        [MaxLength(length: 100, ErrorMessage = "最多包含100条明细")]
        [MinLength(length: 0, ErrorMessage = "至少包含一条明细")]
        public List<CreateInboundDetail> InboundDetails { get; set; }

        public class CreateInboundDetail
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
