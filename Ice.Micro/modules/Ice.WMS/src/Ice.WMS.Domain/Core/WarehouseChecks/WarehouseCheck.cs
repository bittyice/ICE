using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.WarehouseChecks
{
    /// <summary>
    /// 盘点任务
    /// </summary>
    public class WarehouseCheck : AggregateRoot<Guid>, IMultiTenant, ICreationAuditedObject
    {
        protected WarehouseCheck() { }

        public WarehouseCheck(
            Guid id, 
            Guid executor,
            Guid areaId,
            Guid warehouseId,
            Guid creatorId, 
            Guid tenantId)
        {
            Id = id;
            Executor = executor;
            AreaId = areaId;
            WarehouseId = warehouseId;
            CreationTime = DateTime.Now;
            CreatorId = creatorId;
            TenantId = tenantId;
            Status = WarehouseCheckStatus.Waiting;
        }

        public void Start() {
            if (Status != WarehouseCheckStatus.Waiting) {
                throw new UserFriendlyException(message: "盘点任务不是待盘点状态");
            }

            Status = WarehouseCheckStatus.Checking;
            CheckStartTime = DateTime.Now;
        }

        public void Finish() {
            if (Status != WarehouseCheckStatus.Checking)
            {
                throw new UserFriendlyException(message: "盘点任务不是盘点中");
            }

            Status = WarehouseCheckStatus.Checked;
            CheckFinishTime = DateTime.Now;
        }

        public void Invalid() {
            if (
                Status != WarehouseCheckStatus.Checking &&
                Status != WarehouseCheckStatus.Waiting
                )
            {
                throw new UserFriendlyException(message: "只有待盘点和盘点中的任务才能作废");
            }

            Status = WarehouseCheckStatus.Invalid;
        }

        public WarehouseCheckStatus Status { get; protected set; }

        public Guid Executor { get; protected set; }

        public DateTime? CheckStartTime { get; protected set; }

        public DateTime? CheckFinishTime { get; protected set; }

        public DateTime CreationTime { get; protected set; }

        public Guid? CreatorId { get; protected set; }

        public Guid AreaId { get; protected set; }

        public Guid WarehouseId { get; protected set; }

        public Guid? TenantId { get; protected set; }
    }
}
