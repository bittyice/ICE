using Ice.WMS.Core;
using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp.Application.Dtos;

namespace Ice.WMS.Dtos
{
    public class InboundOrderDto
    {
        public Guid Id { get; set; }

        /// <summary>
        /// 入库单号
        /// </summary>
        public string InboundNumber { get; set; }

        /// <summary>
        /// 入库批次号
        /// </summary>
        public string InboundBatch { get; set; }

        /// <summary>
        /// 入库类型
        /// </summary>
        public InboundOrderType Type { get; set; }

        /// <summary>
        /// 入库单状态
        /// </summary>
        public InboundOrderStatus Status { get; set; }

        /// <summary>
        /// 仓库
        /// </summary>
        public Guid WarehouseId { get; set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string Remark { get; set; }

        public Guid? TenantId { get; set; }

        public string ExtraInfo { get; set; }

        /// <summary>
        /// 其他信息
        /// </summary>
        public string OtherInfo { get; set; }

        public ICollection<InboundDetailDto> InboundDetails { get; set; }

        public DateTimeOffset? FinishTime { get; set; }

        public DateTimeOffset CreationTime { get; set; }

        public DateTimeOffset? LastModificationTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}
