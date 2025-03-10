using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.Locations
{
    public class LocationDetail : Entity<Guid>, IMultiTenant
    {
        protected LocationDetail() { }

        public LocationDetail(Guid id, string sku, string inboundBatch, Guid tenantId)
        {
            Id = id;
            Sku = sku;
            InboundBatch = inboundBatch;
            TenantId = tenantId;
        }

        /// <summary>
        /// 盘点
        /// </summary>
        /// <param name="inboundBatch"></param>
        /// <param name="quantity"></param>
        /// <param name="shelfLise"></param>
        public void Check(
            string inboundBatch,
            int quantity,
            DateTime? shelfLise) 
        { 
            InboundBatch = inboundBatch;
            Quantity = quantity;
            ShelfLise = shelfLise;
        }

        public string Sku { get; protected set; }

        /// <summary>
        /// 入库批次号
        /// </summary>
        public string InboundBatch { get; protected set; }

        /// <summary>
        /// 数量
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// 过期时间
        /// </summary>
        public DateTime? ShelfLise { get; set; }

        /// <summary>
        /// 是否冻结
        /// </summary>
        public bool IsFreeze { get; set; }

        public Guid LocationId { get; protected set; }

        public Location Location { get; protected set; }

        public Guid? TenantId { get; protected set; }
    }
}
