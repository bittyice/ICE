using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.PurchaseOrders
{
    public class UpdateInput
    {
        /// <summary>
        /// 入库单号
        /// </summary>
        [Required]
        [RegularExpression("^[a-z|A-Z|0-9]{6,}$", ErrorMessage = "入库单号必须是6位以上的字符或数字")]
        public string OrderNumber { get; set; }

        [Range(0, 99999999, ErrorMessage = "价格必须是0 - 99,999,999范围内")]
        public decimal Price { get; set; }

        public string? Remark { get; set; }

        public string? ExtraInfo { get; set; }

        [MaxLength(length: 100, ErrorMessage = "最多包含100条明细")]
        [MinLength(length: 0, ErrorMessage = "至少包含一条明细")]
        public List<UpdateDetail> Details { get; set; }

        public class UpdateDetail
        {

            [Required]
            public string Sku { get; set; }

            [Required]
            [Range(0, 99999999)]
            public int Quantity { get; set; }

            [Range(0, 99999999)]
            public int GiveQuantity { get; set; }

            [Range(0, 99999999, ErrorMessage = "价格必须是0 - 99,999,999范围内")]
            public decimal Price { get; set; }

            public string? Remark { get; set; }
        }
    }
}
