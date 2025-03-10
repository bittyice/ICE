using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.Areas
{
    public class Area : AggregateRoot<Guid>, IMultiTenant, ISoftDelete
    {
        protected Area() { }

        public Area(Guid id, string code, Guid warehouseId, Guid tenantId) => (Id, Code, WarehouseId, TenantId) = (id, code, warehouseId, tenantId);
        
        /// <summary>
        /// 盘点
        /// </summary>
        public void Checked() {
            LastCheckTime = DateTime.Now;
        }

        public string Code { get; protected set; }

        /// <summary>
        /// 上次盘点时间
        /// </summary>
        public DateTime? LastCheckTime { get; protected set; }

        public bool IsActive { get; set; }

        public string AllowSpecifications { get; set; }

        public string ForbidSpecifications { get; set; }

        public Guid WarehouseId { get; protected set; }

        public Guid? TenantId { get; protected set; }

        public bool IsDeleted { get; set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string Remark { get; set; }
    }
}
