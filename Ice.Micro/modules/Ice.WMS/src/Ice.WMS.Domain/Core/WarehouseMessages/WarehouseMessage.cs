using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.WarehouseMessages
{
    public class WarehouseMessage : AggregateRoot<Guid>, IMultiTenant
    {
        protected WarehouseMessage() { }

        public WarehouseMessage(Guid id, string title, string message, Guid warehouseId, Guid? tenantId)
        {
            Id = id;
            Title = title;
            Message = message;
            Readed = false;
            CreationTime = DateTime.Now;
            TenantId = tenantId;
            WarehouseId = warehouseId;
        }

        public void Read(Guid readId) {
            Readed = true;
            ReadId = readId;
        }

        public string Title { get; protected set; }

        public string Message { get; protected set; }

        public bool Readed { get; protected set; }

        public Guid ReadId { get; protected set; }

        public Guid WarehouseId { get; protected set; }

        public DateTime CreationTime { get; protected set; }

        public Guid? TenantId { get; protected set; }
    }
}
