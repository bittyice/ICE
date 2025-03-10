using Ice.WMS.Core;
using Ice.WMS.Core.InboundOrders;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.WarehouseTransfers.Dtos
{
    public class CreateInput
    {
        [Required]
        public string RecvContact { get; set; }

        [Required]
        public string RecvContactNumber { get; set; }

        [Required]
        public string RecvProvince { get; set; }

        public string RecvCity { get; set; }

        public string RecvTown { get; set; }

        public string RecvStreet { get; set; }

        [Required]
        public string RecvAddressDetail { get; set; }

        public string RecvPostcode { get; set; }

        public List<CreateOutboundDetail> OutboundDetails { get; set; }

        public class CreateOutboundDetail
        {
            [Required]
            public string Sku { get; set; }

            [Required]
            [Range(0, 99999999)]
            public int Quantity { get; set; }

            [Range(0, 99999999)]
            public decimal TotalAmount { get; set; }
        }

        /// <summary>
        /// 始发
        /// </summary>
        [Required]
        public Guid OriginWarehouseId { get; set; }

        /// <summary>
        /// 目的仓库
        /// </summary>
        [Required]
        public Guid DestinationWarehouseId { get; set; }
    }
}
