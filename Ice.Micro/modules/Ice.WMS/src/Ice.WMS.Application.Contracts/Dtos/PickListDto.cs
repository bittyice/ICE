using Ice.WMS.Core;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class PickListDto
    {
        public Guid Id { get; set; }

        /// <summary>
        /// 拣货单号
        /// </summary>
        public string PickListNumber { get; set; }

        /// <summary>
        /// 包含订单数量
        /// </summary>
        public int OrderCount { get; set; }

        /// <summary>
        /// 状态
        /// </summary>
        public PickListStatus Status { get; set; }

        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTimeOffset CreationTime { get; set; }

        /// <summary>
        /// 所属仓库
        /// </summary>
        public Guid WarehouseId { get; set; }
    }
}
