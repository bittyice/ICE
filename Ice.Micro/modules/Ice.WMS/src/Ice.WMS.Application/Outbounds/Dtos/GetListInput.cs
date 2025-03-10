using Ice.Utils;
using Ice.WMS.Core;
using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.Outbounds.Dtos
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string OutboundNumber { get; set; }

        public string RecvContact { get; set; }

        public string RecvContactNumber { get; set; }

        public string Area { get; set; }

        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }

        public OutboundOrderStatus? Status { get; set; }

        public string OrderType { get; set; }

        public bool? Reviewed { get; set; }

        public Guid? PickListId { get; set; }

        /// <summary>
        /// 仓库
        /// </summary>
        [Required]
        public Guid WarehouseId { get; set; }
    }
}
