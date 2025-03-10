using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.Warehouses
{
    public class Warehouse : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        protected Warehouse() { }

        public Warehouse(Guid id, string code, Guid tenantId) => (Id, Code, TenantId) = (id, code, tenantId);

        /// <summary>
        /// 编码
        /// </summary>
        public string Code { get; protected set; }

        /// <summary>
        /// 仓库名
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 联系人
        /// </summary>
        public string ContactNumber { get; set; }

        /// <summary>
        /// 所在省份
        /// </summary>
        public string Province { get; set; }

        /// <summary>
        /// 城市
        /// </summary>
        public string City { get; set; }

        /// <summary>
        /// 区
        /// </summary>
        public string Town { get; set; }

        /// <summary>
        /// 街道
        /// </summary>
        public string Street { get; set; }

        /// <summary>
        /// 详细地址
        /// </summary>
        public string AddressDetail { get; set; }

        /// <summary>
        /// 邮编
        /// </summary>
        public string Postcode { get; set; }

        /// <summary>
        /// 负责人
        /// </summary>
        public string Principal { get; set; }

        public string Remark { get; set; }

        public bool IsActive { get; set; }

        public bool EnableInboundBatch { get; set; }

        public Guid? TenantId { get; protected set; }
    }
}
