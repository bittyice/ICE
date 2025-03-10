using Ice.Utils;
using Ice.WMS.Core;
using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.StockChangeLogs.Dtos
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        /// <summary>
        /// 关联记录
        /// </summary>
        public Guid? RelationId { get; set; }

        /// <summary>
        /// 仓库
        /// </summary>
        public Guid? WarehouseId { get; set; }
    }
}
