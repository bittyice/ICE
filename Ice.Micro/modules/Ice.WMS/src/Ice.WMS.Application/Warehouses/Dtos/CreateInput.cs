using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.Warehouses.Dtos
{
    public class CreateInput
    {
        [Required]
        [RegularExpression("^[a-z|A-Z|0-9]{2,}$", ErrorMessage = "编码必须是2位以上的字符或数字")]
        public string Code { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string ContactNumber { get; set; }

        [Required]
        public string Province { get; set; }

        public string City { get; set; }

        public string Town { get; set; }

        public string Street { get; set; }

        [Required]
        public string AddressDetail { get; set; }

        public string Postcode { get; set; }

        public string Remark { get; set; }

        public string Principal { get; set; }

        public bool IsActive { get; set; }

        public bool EnableInboundBatch { get; set; }
    }
}
