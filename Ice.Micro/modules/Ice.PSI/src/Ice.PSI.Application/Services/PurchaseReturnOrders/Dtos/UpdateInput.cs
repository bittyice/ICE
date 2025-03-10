using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.PurchaseReturnOrders
{
    public class UpdateInput
    {
        [Range(0, 99999999, ErrorMessage = "价格必须是0 - 99,999,999范围内")]
        public decimal Price { get; set; }

        public string? Reason { get; set; }

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

            [Range(0, 99999999, ErrorMessage = "价格必须是0 - 99,999,999范围内")]
            public decimal Price { get; set; }

            public string? Remark { get; set; }
        }
    }
}
