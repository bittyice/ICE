using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.LossReportOrders
{
    public class LossReportDetail : Entity<Guid>, IMultiTenant
    {
        public string Sku { get; protected set; }

        public int Quantity { get; protected set; }

        public Guid LossReportOrderId { get; protected set; }

        public Guid? TenantId { get; protected set; }

        protected LossReportDetail() { }

        public LossReportDetail(Guid id, string sku, int quantity, Guid? tenantId)
        {
            Id = id;
            Sku = sku;
            Quantity = quantity;
            TenantId = tenantId;
        }
    }
}
