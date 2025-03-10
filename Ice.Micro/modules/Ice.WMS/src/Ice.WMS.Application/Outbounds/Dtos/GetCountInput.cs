using Ice.WMS.Core;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Outbounds.Dtos
{
    public class GetCountInput
    {
        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }

        public OutboundOrderStatus? Status { get; set; }

        /// <summary>
        /// 仓库
        /// </summary>
        [Required]
        public Guid WarehouseId { get; set; }
    }
}
