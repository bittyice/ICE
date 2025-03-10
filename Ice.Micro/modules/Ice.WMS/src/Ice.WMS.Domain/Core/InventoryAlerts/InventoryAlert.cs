using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.InventoryAlerts
{
    /// <summary>
    /// 库存预警
    /// </summary>
    public class InventoryAlert : AggregateRoot<Guid>, IMultiTenant, ICreationAuditedObject
    {
        protected InventoryAlert() { }

        public InventoryAlert(Guid id, string sku, Guid creatorId, Guid warehouseId, Guid tenantId)
        {
            Id = id;
            Sku = sku;
            TenantId = tenantId;
            CreationTime = DateTime.Now;
            CreatorId = creatorId;
            WarehouseId = warehouseId;
        }

        public string Sku { get; protected set; }

        public int Quantity { get; set; }

        public bool IsActive { get; set; }

        public Guid WarehouseId { get; protected set; }

        public Guid? TenantId { get; protected set; }

        public DateTime CreationTime { get; protected set; }

        public Guid? CreatorId { get; protected set; }
    }
}
