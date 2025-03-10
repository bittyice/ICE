using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.PSI.Services.SaleOrders
{
    public class UpdateInput
    {
        public string? Seller { get; set; }

        public string? ExtraInfo { get; set; }

        public string? Remark { get; set; }

        public InputAddress RecvInfo { get; set; }

        [MaxLength(length: 100, ErrorMessage = "最多包含100条明细")]
        [MinLength(length: 0, ErrorMessage = "至少包含一条明细")]
        public List<InputDetail> Details { get; set; }

        public class InputDetail
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
            public int Quantity { get; set; }

            /// <summary>
            /// 赠送数量（有时候买10箱会赠送1箱）
            /// </summary>
            [Range(0, 99999999)]
            public int GiveQuantity { get; set; }

            [Range(0, 99999999)]
            public decimal PlacePrice { get; set; }
        }

        public class InputAddress
        {
            /// <summary>
            /// 商户名
            /// </summary>
            [Required]
            public string BusinessName { get; set; }

            /// <summary>
            /// 联系人
            /// </summary>
            [Required]
            public string Contact { get; set; }

            /// <summary>
            /// 联系电话
            /// </summary>
            [Required]
            public string ContactNumber { get; set; }

            /// <summary>
            /// 省份（退到哪里）
            /// </summary>
            public string? Province { get; set; }

            /// <summary>
            /// 城市
            /// </summary>
            public string? City { get; set; }

            /// <summary>
            /// 区
            /// </summary>
            public string? Town { get; set; }

            /// <summary>
            /// 街道
            /// </summary>
            public string? Street { get; set; }

            /// <summary>
            /// 地址
            /// </summary>
            public string? AddressDetail { get; set; }

            /// <summary>
            /// 邮编
            /// </summary>
            public string? Postcode { get; set; }
        }
    }
}
