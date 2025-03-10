using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.WarehouseTransfers
{
    /// <summary>
    /// 调拨任务
    /// </summary>
    public class WarehouseTransfer : AggregateRoot<Guid>, IMultiTenant, ICreationAuditedObject
    {
        protected WarehouseTransfer() { }

        public WarehouseTransfer(
            Guid id,
            string transferNumber,
            Guid originWarehouseId,
            Guid destinationWarehouseId,
            Guid outboundOrderId,
            Guid inboundOrderId,
            Guid tenantId
            ) 
        { 
            Id = id;
            TransferNumber = transferNumber;
            OriginWarehouseId = originWarehouseId;
            DestinationWarehouseId = destinationWarehouseId;
            OutboundOrderId = outboundOrderId;
            InboundOrderId = inboundOrderId;
            TenantId = tenantId;
        }

        public string TransferNumber { get; protected set; }

        public Guid OriginWarehouseId { get; protected set; }

        public Guid OutboundOrderId { get; protected set; }

        public Guid DestinationWarehouseId { get; protected set; }

        public Guid? InboundOrderId { get; protected set; }

        public Guid? TenantId { get; protected set; }

        public DateTime CreationTime { get; protected set; }

        public Guid? CreatorId { get; protected set; }
    }
}
