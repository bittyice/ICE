using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class AreaDto
    {
        public Guid Id { get; set; }

        public string Code { get; set; }

        public DateTimeOffset? LastCheckTime { get; set; }

        public bool IsActive { get; set; }

        public string AllowSpecifications { get; set; }

        public string ForbidSpecifications { get; set; }

        public Guid WarehouseId { get; set; }

        public Guid? TenantId { get; set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string Remark { get; set; }
    }
}
