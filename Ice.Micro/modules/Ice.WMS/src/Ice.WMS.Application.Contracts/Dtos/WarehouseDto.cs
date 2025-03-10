using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class WarehouseDto
    {
        public Guid Id { get; set; }

        public string Code { get; set; }

        public string Name { get; set; }

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

        public string Remark { get; set; }

        public bool IsActive { get; set; }

        public string Principal { get; set; }

        public bool EnableInboundBatch { get; set; }

        public Guid? TenantId { get; set; }

        public DateTimeOffset CreationTime { get; set; }

        public Guid? CreatorId { get; set; }

        public Guid? LastModifierId { get; set; }

        public DateTimeOffset? LastModificationTime { get; set; }
    }
}
