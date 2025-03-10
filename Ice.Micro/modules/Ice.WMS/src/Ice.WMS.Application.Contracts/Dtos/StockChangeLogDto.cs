using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class StockChangeLogDto
    {
        /// <summary>
        /// ID
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// 关联ID
        /// </summary>
        public Guid? RelationId { get; set; }

        /// <summary>
        /// SKU
        /// </summary>
        public string Sku { get; set; }

        /// <summary>
        /// 库位编码
        /// </summary>
        public string Location { get; set; }

        /// <summary>
        /// 变更数量
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// 仓库
        /// </summary>
        public Guid WarehouseId { get; set; }

        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTimeOffset CreationTime { get; set; }
    }
}
