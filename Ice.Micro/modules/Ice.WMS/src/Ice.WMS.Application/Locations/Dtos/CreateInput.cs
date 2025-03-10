using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.Locations.Dtos
{
    public class CreateInput
    {
        [Required]
        [RegularExpression("^[a-z|A-Z|0-9|\\-]{1,10}$", ErrorMessage = "编码必须是1至10位的字符或数字或-")]
        public string Code { get; set; }

        public int Volume { get; set; }

        [Required]
        public Guid AreaId { get; set; }
    }
}
