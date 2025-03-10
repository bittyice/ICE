using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Inbounds.Dtos
{
    public class CheckInput
    {
        /// <summary>
        /// SKU
        /// </summary>
        [Required]
        public string Sku { get; set; }

        /// <summary>
        /// 过期时间
        /// </summary>
        public DateTimeOffset? ShelfLise { get; set; }

        /// <summary>
        /// 实际到货数量
        /// </summary>
        public int ActualQuantity { get; set; }
    }
}
