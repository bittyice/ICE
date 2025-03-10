using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.PurchaseOrders
{
    public class CreateInput
    {
        [Range(0, 99999999, ErrorMessage = "价格必须是0 - 99,999,999范围内")]
        public decimal Price { get; set; }

        public string? Remark { get; set; }

        [Required]
        public Guid SupplierId { get; set; }

        public string? ExtraInfo { get; set; }

        [MaxLength(length: 100, ErrorMessage = "最多包含100条明细")]
        [MinLength(length: 0, ErrorMessage = "至少包含一条明细")]
        public List<CreateDetail> Details { get; set; }

        public class CreateDetail
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
