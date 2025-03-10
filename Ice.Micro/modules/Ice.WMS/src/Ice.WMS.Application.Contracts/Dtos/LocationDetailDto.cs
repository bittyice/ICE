using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class LocationDetailDto
    {
        public Guid Id { get; set; }

        public string Sku { get; set; }

        /// <summary>
        /// 入库批次号
        /// </summary>
        public string InboundBatch { get; set; }

        /// <summary>
        /// 数量
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// 过期时间
        /// </summary>
        public DateTimeOffset? ShelfLise { get; set; }

        /// <summary>
        /// 是否冻结
        /// </summary>
        public bool IsFreeze { get; set; }

        public Guid LocationId { get; set; }

        public Guid? TenantId { get; set; }
    }
}
