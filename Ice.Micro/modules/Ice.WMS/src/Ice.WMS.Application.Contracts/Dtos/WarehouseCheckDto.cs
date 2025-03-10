using Ice.WMS.Core;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class WarehouseCheckDto
    {
        public Guid Id { get; set; }

        public WarehouseCheckStatus Status { get; set; }

        public Guid Executor { get; set; }

        public DateTimeOffset? CheckStartTime { get; set; }

        public DateTimeOffset? CheckFinishTime { get; set; }

        public DateTimeOffset CreationTime { get; set; }

        public Guid? CreatorId { get; set; }

        public Guid AreaId { get; set; }

        public Guid? TenantId { get; set; }
    }
}
