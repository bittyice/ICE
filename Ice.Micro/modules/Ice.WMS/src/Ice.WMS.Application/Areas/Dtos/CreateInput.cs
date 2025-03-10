using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.Areas.Dtos
{
    public class CreateInput
    {
        [Required]
        [RegularExpression("^[a-z|A-Z|0-9]{1,5}$", ErrorMessage = "编码必须是1至5位的字符或数字")]
        public string Code { get; set; }

        public string AllowSpecifications { get; set; }

        public string ForbidSpecifications { get; set; }

        [Required]
        public Guid WarehouseId { get; set; }

        public bool IsActive { get; set; }
    }
}
