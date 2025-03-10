using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.SaleReturnOrders
{
    public class UpdateInput
    {
        /// <summary>
        /// 客户名称
        /// </summary>
        public string? BusinessName { get; set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string? Remark { get; set; }

        /// <summary>
        /// 扩展信息
        /// </summary>
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

            [Range(0, 99999999, ErrorMessage = "单价必须是0 - 99,999,999范围内")]
            public decimal UnitPrice { get; set; }
        }
    }
}
