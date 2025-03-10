using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp.Data;

namespace Ice.PSI.Dtos
{
    public class ProductStockDto
    {
        public Guid Id { get; set; }

        /// <summary>
        /// SKU
        /// </summary>
        public string Sku { get; set; }

        // 库存
        public int Stock { get; set; }
    }
}
