﻿using Ice.Utils;
using Ice.WMS.Core;
using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.LossReportOrders.Dtos
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string OrderNumber { get; set; }

        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }

        public LossReportOrderStatus? Status { get; set; }

        /// <summary>
        /// 仓库
        /// </summary>
        [Required]
        public Guid WarehouseId { get; set; }
    }
}
