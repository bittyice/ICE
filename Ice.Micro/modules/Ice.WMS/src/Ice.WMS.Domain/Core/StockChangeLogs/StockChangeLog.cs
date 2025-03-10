using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.StockChangeLogs
{
    /// <summary>
    /// 库位变化
    /// </summary>
    public class StockChangeLog : AggregateRoot<Guid>, IMultiTenant
    {
        /// <summary>
        /// 关联ID
        /// </summary>
        public Guid? RelationId { get; set; }

        /// <summary>
        /// SKU
        /// </summary>
        public string Sku { get; set; }

        /// <summary>
        /// 库位编码
        /// </summary>
        public string Location { get; set; }

        /// <summary>
        /// 变更数量
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreationTime { get; set; }

        /// <summary>
        /// 仓库
        /// </summary>
        public Guid WarehouseId { get; set; }

        /// <summary>
        /// 租户
        /// </summary>
        public Guid? TenantId { get; protected set; }
    }
}
