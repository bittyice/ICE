using Ice.WMS.Core;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class LossReportOrderDto
    {
        public Guid Id { get; set; }

        public string OrderNumber { get; set; }

        public LossReportOrderStatus Status { get; set; }

        public Guid WarehouseId { get; set; }

        public string ExtraInfo { get; set; }

        public ICollection<LossReportDetailDto> Details { get; set; }

        public DateTimeOffset CreationTime { get; set; }

        public Guid? CreatorId { get; set; }

        public Guid? LastModifierId { get; set; }

        public DateTimeOffset? LastModificationTime { get; set; }

        public Guid? DeleterId { get; set; }

        public DateTimeOffset? DeletionTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}
