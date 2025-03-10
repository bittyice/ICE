using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class TransferSkuDto
    {
        public Guid Id { get; set; }

        /// <summary>
        /// SKU
        /// </summary>
        public string Sku { get; protected set; }

        /// <summary>
        /// 入库批次号
        /// </summary>
        public string InboundBatch { get; protected set; }

        /// <summary>
        /// 数量
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// 过期时间
        /// </summary>
        public DateTime? ShelfLise { get; protected set; }
    }
}
