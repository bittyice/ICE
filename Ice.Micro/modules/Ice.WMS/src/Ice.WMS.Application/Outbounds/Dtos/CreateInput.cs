using Ice.WMS.Core;
using Ice.WMS.Core.InboundOrders;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.Outbounds.Dtos
{
    public class CreateInput
    {
        /// <summary>
        /// 出库单号
        /// </summary>
        [RegularExpression("^[a-z|A-Z|0-9|\\-|_]{6,}$", ErrorMessage = "出库单号必须是6位以上的字符或数字")]
        public string OutboundNumber { get; set; }

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

        /// <summary>
        /// 仓库
        /// </summary>
        [Required]
        public Guid WarehouseId { get; set; }

        public string ExtraInfo { get; set; }

        public string Remark { get; set; }

        public string OtherInfo { get; set; }

        [Required]
        public string OrderType { get; set; }

        [MaxLength(length: 100, ErrorMessage = "最多包含100条明细")]
        [MinLength(length: 1, ErrorMessage = "至少包含一条明细")]
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
    }
}
