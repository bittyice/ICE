using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Core.Locations
{
    public class OnOffShelfSkuInfo
    {
        /// <summary>
        /// 下载的sku
        /// </summary>
        public string Sku { get; protected set; }

        /// <summary>
        /// 数量
        /// </summary>
        public int Quantity { get; protected set; }

        /// <summary>
        /// 入库批次号
        /// </summary>
        public string? InboundBatch { get; protected set; }

        /// <summary>
        /// 过期时间
        /// </summary>
        public DateTime? ShelfLise { get; protected set; }

        public OnOffShelfSkuInfo(string sku, int quantity, string? inboundBatch, DateTime? shelfLise) 
        {
            Sku = sku;
            Quantity = quantity;
            InboundBatch = inboundBatch;
            ShelfLise = shelfLise;
        }
    }
}
