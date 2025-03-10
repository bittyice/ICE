using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;
using System.Linq;
using Volo.Abp;
using Volo.Abp.Guids;

namespace Ice.WMS.Core.PickLists
{
    public class PickList : AggregateRoot<Guid>, IMultiTenant, IHasCreationTime, IHasDeletionTime, ISoftDelete
    {
        protected PickList() { }

        public PickList(Guid id, string pickListNumber, int orderCount, Guid warehouseId, Guid tenantId) 
        {
            Id = id;
            PickListNumber = pickListNumber;
            OrderCount = orderCount;
            Status = PickListStatus.Picking;
            WarehouseId = warehouseId;
            TenantId = tenantId;
            CreationTime = DateTime.Now;
        }

        /// <summary>
        /// 完成拣货
        /// </summary>
        public void ToPickingDone()
        {
            if (Status != PickListStatus.Picking)
            {
                throw new UserFriendlyException(message: $"订单状态变更失败，拣货单状态不是拣货中");
            }

            Status = PickListStatus.Complete;
        }

        /// <summary>
        /// 作废
        /// </summary>
        /// <exception cref="UserFriendlyException"></exception>
        public void ToInvalid() {
            if (Status != PickListStatus.Picking)
            {
                throw new UserFriendlyException(message: $"订单状态变更失败，拣货单状态不是拣货中");
            }

            Status = PickListStatus.Invalid;
        }

        /// <summary>
        /// 拣货单号
        /// </summary>
        public string PickListNumber { get; protected set; }

        /// <summary>
        /// 管理订单数量
        /// </summary>
        public int OrderCount { get; protected set; }

        /// <summary>
        /// 状态
        /// </summary>
        public PickListStatus Status { get; protected set; }

        /// <summary>
        /// 仓库
        /// </summary>
        public Guid WarehouseId { get; protected set; }

        /// <summary>
        /// 租户
        /// </summary>
        public Guid? TenantId { get; protected set; }

        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreationTime { get; protected set; }

        /// <summary>
        /// 删除时间
        /// </summary>
        public DateTime? DeletionTime { get; set; }
        
        /// <summary>
        /// 是否删除
        /// </summary>
        public bool IsDeleted { get; set; }
    }
}
