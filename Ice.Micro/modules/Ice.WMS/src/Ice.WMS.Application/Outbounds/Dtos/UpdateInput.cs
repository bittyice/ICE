using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.Outbounds.Dtos
{
    public class UpdateInput
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

        public string ExtraInfo { get; set; }

        public string Remark { get; set; }

        public string OtherInfo { get; set; }

        [MaxLength(length: 100, ErrorMessage = "最多包含100条明细")]
        [MinLength(length: 0, ErrorMessage = "至少包含一条明细")]
        public List<UpdateOutboundDetail> OutboundDetails { get; set; }

        public class UpdateOutboundDetail
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
