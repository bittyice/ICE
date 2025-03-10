using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.TransferSkus
{
    /// <summary>
    /// 移库SKU（在移库操作中已经下架的SKU）
    /// </summary>
    public class TransferSku : AggregateRoot<Guid>, IMultiTenant
    {
        /// <summary>
        /// SKU
        /// </summary>
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
        public DateTime? ShelfLise { get; protected set; }

        public Guid WarehouseId { get; protected set; }

        public Guid? TenantId { get; protected set; }

        public TransferSku(Guid id, string sku, string inboundBatch, int quantity, DateTime? shelfLise, Guid warehouseId)
        {
            Id = id;
            Sku = sku;
            InboundBatch = inboundBatch;
            Quantity = quantity;
            ShelfLise = shelfLise;
            WarehouseId = warehouseId;
        }
    }
}
