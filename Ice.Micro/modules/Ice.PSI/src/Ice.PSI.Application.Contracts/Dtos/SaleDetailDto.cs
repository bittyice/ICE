using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Dtos
{
    public class SaleDetailDto
    {
        public Guid Id { get; set; }

        /// <summary>
        /// SKU
        /// </summary>
        public string Sku { get; set; }

        /// <summary>
        /// 数量
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// 赠送数量（有时候买10箱会赠送1箱）
        /// </summary>
        public int GiveQuantity { get; set; }

        /// <summary>
        /// 下单时单价
        /// </summary>
        public decimal PlacePrice { get; set; }
    }
}
